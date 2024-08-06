const OUTPUTS_KEY = "goodUI.stores.outputsManager.outputs"
const LAST_PROMPT_ID_KEY = "goodUI.stores.outputsManager.lastPromptId"

import { connectWorkflowManager } from "./workflowManager.svelte"
import { api } from "./apiConnectionManager.svelte"
import { cache } from "./imageCache.svelte"

const manager = connectWorkflowManager()

function flattenImageQueries(rawOutputs) {
  // cba to work with deeply nested Promise.all rn
  const flattened = []
  Object.entries(rawOutputs).forEach(([nodeId, outputs]) => {
    Object.entries(outputs).forEach(([key, imagesArray]) => {
      imagesArray.forEach((attributes) => {
        flattened.push([nodeId, key, attributes])
      })
    })
  })

  return flattened
}

async function pollImages(rawOutputs) {
  const out = {}
  const fmt = await Promise.all(
    flattenImageQueries(rawOutputs).map(
      async ([nodeId, nodeKey, attributes], nodeOutputIdx) => {
        const dbValues = [
          manager.workflowName,
          nodeId,
          nodeKey,
          nodeOutputIdx,
          attributes.type,
          attributes.filename,
        ]

        const key = dbValues.join(".")
        const cachedResult = await cache.getImage(key)
        if (cachedResult) {
          return [
            cachedResult.nodeId,
            nodeKey,
            attributes.filename,
            URL.createObjectURL(cachedResult.blob),
          ]
        }

        // else, cache miss

        const blob = await api.view(attributes)
        const fullFlow = JSON.parse(JSON.stringify(manager.current)) // must dupe
        const insertValues = {
          key,
          workflowName: manager.workflowName,
          nodeId,
          nodeKey,
          nodeOutputIdx,
          type: attributes.type,
          filename: attributes.filename,
          blob,
          workflow: fullFlow,
          workflowSearch: JSON.stringify(fullFlow),
        }

        await cache.saveImage({ ...insertValues })

        return [nodeId, nodeKey, attributes.filename, URL.createObjectURL(blob)]
      },
    ),
  )
  fmt.forEach(([id, key, fname, blob]) => {
    out[id] ||= {}
    out[id][key] ||= []
    out[id][key].push([fname, blob])
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
let pollingDelay = 150
let allOutputs = $state(JSON.parse(localStorage.getItem(OUTPUTS_KEY) || "{}"))
let lastPromptId = $state(
  JSON.parse(localStorage.getItem(LAST_PROMPT_ID_KEY) || '""'),
)

let mostRecent = $derived(allOutputs[lastPromptId])

let mostRecentImages = $state({})

export const outputs = {
  get mostRecent() {
    return mostRecent || {}
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
      if (!Object.keys(info).length) {
        pollingDelay *= 2 // simple backoff 4 now
        return // no result yet
      }

      // got results
      selectAndSaveOutput(promptId, info[promptId].outputs)

      pollingDelay = 150 // reset
      clearInterval(polling)
    }, pollingDelay)
  },
  pollImages,
}
