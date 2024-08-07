// View state is specific to a component. Persists across refresh

const KEY = "goodUI.views.workflowContentsExpandedNodes"

import { connectWorkflowManager } from "../stores/workflowManager.svelte"
const manager = connectWorkflowManager()

let allExpandedNodes = $state(JSON.parse(localStorage.getItem(KEY) || "{}"))

let current = $derived(allExpandedNodes[manager.workflowName])

// shape:
// workflow_name
//     -> node_id
//         -> input_key = bool

export function isInputExpanded(nodeId, inputKey) {
  if (!current) return false
  if (!current[nodeId]) return false
  if (!current[nodeId][inputKey]) return false

  return current[nodeId][inputKey]
}

export const expandedState = {
  get current() {
    return current || {}
  },
  toggleNode(id) {
    if (!current)
      return (allExpandedNodes[manager.workflowName] = {
        [id]: {},
      })

    if (current[id]) {
      // delete da whole thing
      delete allExpandedNodes[manager.workflowName][id]
    } else {
      allExpandedNodes[manager.workflowName][id] = {}
    }
  },
  toggleInput(nodeId, inputKey) {
    const shape = JSON.parse(JSON.stringify(allExpandedNodes))
    if (!current) {
      shape[manager.workflowName] = {
        [nodeId]: {
          [inputKey]: 1,
        },
      }
    }

    if (!current[nodeId]) {
      shape[manager.workflowName][nodeId] = {
        [inputKey]: 1,
      }
    }

    if (current[nodeId][inputKey]) {
      delete shape[manager.workflowName][nodeId][inputKey]
    } else {
      shape[manager.workflowName][nodeId][inputKey] = 1
    }

    return (allExpandedNodes = shape)
  },
  save() {
    localStorage.setItem(KEY, JSON.stringify(allExpandedNodes))
  },
}
