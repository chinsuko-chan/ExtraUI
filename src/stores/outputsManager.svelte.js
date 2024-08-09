const OUTPUTS_KEY = "goodUI.stores.outputsManager.outputs"
const LAST_PROMPT_ID_KEY = "goodUI.stores.outputsManager.lastPromptId"

let allOutputs = $state(JSON.parse(localStorage.getItem(OUTPUTS_KEY) || "{}"))
let lastPromptId = $state(
  JSON.parse(localStorage.getItem(LAST_PROMPT_ID_KEY) || '""'),
)

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
export async function fetchImage({ nodeId, inputKey, attributes }) {
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
    /** @hack idk if this is dvelopment side effect but cba rn */
    const malformedBlob = !cachedResult.blob?.size
    return {
      nodeId: cachedResult.nodeId,
      inputKey,
      filename: attributes.filename,
      blob: malformedBlob ? null : URL.createObjectURL(cachedResult.blob),
    }
  }

  // else, cache miss
  const blob = await api.view(attributes)
  const insertValues = {
    key,
    workflowName: manager.workflowName,
    nodeId,
    inputKey,
    type: attributes.type,
    filename: attributes.filename,
    blob,
    workflow: $state.snapshot(manager.currentWorkflow),
    workflowSearch: JSON.stringify($state.snapshot(manager.currentWorkflow)),
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
  /**
   * @gotcha some nodes produce empty objects as their "output"
   *         ...which messes up like 2 edge cases i cba to document rn
   *         skip these nodes entirely
   */
  const filteredOutputs = Object.entries(outputs).reduce(
    (finalOut, [nodeId, nodeOutputs]) => {
      const isEmpty = Object.entries(nodeOutputs).every(
        ([_key, arrayOfOutputs]) => {
          return arrayOfOutputs.length === 0
        },
      )
      if (!isEmpty) {
        finalOut[nodeId] = nodeOutputs
      }
      return finalOut
    },
    {},
  )

  // 1. init
  allOutputs[manager.workflowName] ||= []

  // 2. add new value to stack
  allOutputs[manager.workflowName].unshift([promptId, filteredOutputs])
  lastPromptId = promptId

  // 3. save to localStorage
  localStorage.setItem(OUTPUTS_KEY, JSON.stringify(allOutputs))
  localStorage.setItem(LAST_PROMPT_ID_KEY, JSON.stringify(promptId))
}

let polling = -1
let pollingDelay = 0

let mostRecent = $derived.by(() => {
  if (!allOutputs[manager.workflowName]) return
  if (!allOutputs[manager.workflowName].length) return
  return allOutputs[manager.workflowName][0][1]
})
let mostRecentFilenames = $derived.by(() => {
  if (!mostRecent) return []
  return flattenOutputs(mostRecent).map(({ attributes }) => {
    return attributes.filename
  })
})
let mostRecentImages = $state({})

export const outputs = {
  get history() {
    return allOutputs[manager.workflowName] || []
  },
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
    if (
      allOutputs[manager.workflowName] &&
      allOutputs[manager.workflowName].find(([pId]) => pId === promptId)
    ) {
      return (lastPromptId = promptId)
    }
    let canPoll = true

    polling = setInterval(async () => {
      if (!canPoll) return
      canPoll = false
      const info = await api.history(promptId)
      // No api result yet
      if (!Object.keys(info).length) {
        if (pollingDelay === 0) {
          // english: second attempt
          pollingDelay = 750
        } else {
          // english: third attempt onward
          pollingDelay = Math.round(pollingDelay * 1.5)
        }

        return setTimeout(() => (canPoll = true), pollingDelay)
        canPoll = true
      }

      // got results
      selectAndSaveOutput(promptId, info[promptId].outputs)

      pollingDelay = 0 // reset
      clearInterval(polling)
    }, pollingDelay)
  },
  pollImages,
}
