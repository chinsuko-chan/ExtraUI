const OUTPUTS_KEY = "goodUI.stores.outputsManager.outputs"
const LAST_PROMPT_ID_KEY = "goodUI.stores.outputsManager.lastPromptId"

import { connectWorkflowManager } from "./workflowManager.svelte"
import { api } from "./apiConnectionManager.svelte"
import { cache } from "./imageCache.svelte"

const manager = connectWorkflowManager()

function flattenOutputs(outputsByNode) {
  // cba to work with deeply nested Promise.all rn
  const flattened = []
  Object.entries(outputsByNode).forEach(([nodeId, outputs]) => {
    Object.entries(outputs).forEach(([inputKey, imagesArray]) => {
      imagesArray.forEach((attributes) => {
        flattened.push({ nodeId, inputKey, attributes })
      })
    })
  })

  return flattened
}

/** fetch single image from cache or API */
async function fetchImage({ nodeId, inputKey, attributes }) {
  const dbValues = [
    manager.workflowName,
    nodeId,
    inputKey,
    attributes.type,
    attributes.filename,
  ]

  const key = dbValues.join(".")
  const cachedResult = await cache.getImage(key)
  if (cachedResult) {
    return {
      nodeId: cachedResult.nodeId,
      inputKey,
      filename: attributes.filename,
      blob: URL.createObjectURL(cachedResult.blob),
    }
  }

  // else, cache miss
  const blob = await api.view(attributes)
  const fullFlow = JSON.parse(JSON.stringify(manager.currentWorkflow)) // must dupe
  const insertValues = {
    key,
    workflowName: manager.workflowName,
    nodeId,
    inputKey,
    type: attributes.type,
    filename: attributes.filename,
    blob,
    workflow: fullFlow,
    workflowSearch: JSON.stringify(fullFlow),
  }

  await cache.saveImage({ ...insertValues })
  return {
    nodeId,
    inputKey,
    filename: attributes.filename,
    blob: URL.createObjectURL(blob),
  }
}

async function pollImages(outputsByNode) {
  const out = {}
  const promises = flattenOutputs(outputsByNode).map(fetchImage)
  const fmt = await Promise.all(promises)

  fmt.forEach(({ nodeId, inputKey, filename, blob }) => {
    out[nodeId] ||= {}
    out[nodeId][inputKey] ||= []
    out[nodeId][inputKey].push([filename, blob])
  })

  mostRecentImages = out
}

function selectAndSaveOutput(promptId, outputs) {
  // 1. set new values
  allOutputs[promptId] = outputs
  lastPromptId = promptId

  // 2. save to localStorage
  localStorage.setItem(OUTPUTS_KEY, JSON.stringify(allOutputs))
  localStorage.setItem(LAST_PROMPT_ID_KEY, JSON.stringify(promptId))
}

let polling = -1
let pollingDelay = 0
let allOutputs = $state(JSON.parse(localStorage.getItem(OUTPUTS_KEY) || "{}"))
let lastPromptId = $state(
  JSON.parse(localStorage.getItem(LAST_PROMPT_ID_KEY) || '""'),
)

let mostRecent = $derived(allOutputs[lastPromptId])
let mostRecentFilenames = $derived.by(() => {
  if (!mostRecent) return []
  return flattenOutputs(mostRecent).map(({ attributes }) => {
    return attributes.filename
  })
})
let mostRecentImages = $state({})

export const outputs = {
  get mostRecent() {
    return mostRecent || {}
  },
  get mostRecentFilenames() {
    return mostRecentFilenames
  },
  get mostRecentImages() {
    return mostRecentImages || {}
  },
  poll(promptId) {
    if (allOutputs[promptId]) {
      return (lastPromptId = promptId)
    }

    polling = setInterval(async () => {
      const info = await api.history(promptId)
      // No api result yet
      if (!Object.keys(info).length) {
        // initial polling request should be instant
        if (pollingDelay === 0) return (pollingDelay = 500)

        // all subsequent attempts use backoff
        return (pollingDelay *= 2)
      }

      // got results
      selectAndSaveOutput(promptId, info[promptId].outputs)

      pollingDelay = 0 // reset
      clearInterval(polling)
    }, pollingDelay)
  },
  pollImages,
}
