// View state is specific to a component. Persists across refresh

const KEY = "goodUI.views.workflowEditor.allExpandedNodes"

import { connectWorkflowManager } from "stores/workflowManager.svelte"
const workflowManager = connectWorkflowManager()

let allExpandedNodes = $state(JSON.parse(localStorage.getItem(KEY) || "{}"))

let currentExpanded = $derived(allExpandedNodes[workflowManager.workflowName])

// shape:
// workflow_name
//     -> node_id
//         -> input_key = bool

function setCurrentExpanded(id, newValues) {
  allExpandedNodes[workflowManager.workflowName] ||= {}
  allExpandedNodes[workflowManager.workflowName][id] = newValues
}

function deleteCurrentExpanded(id) {
  delete allExpandedNodes[workflowManager.workflowName][id]
}

export function isExpandedNode(nodeId) {
  if (!currentExpanded) return false
  return currentExpanded[nodeId]
}

export function isExpandedInput(nodeId, inputKey) {
  if (!currentExpanded) return false
  if (!currentExpanded[nodeId]) return false
  if (!currentExpanded[nodeId][inputKey]) return false

  return currentExpanded[nodeId][inputKey]
}

/** connect this to each node (at the child level) */
export function connectViewState(id, key = null) {
  return {
    get isExpandedInput() {
      if (!key)
        throw new Error("(isExpandedInput) must connect this to an input")
      return isExpandedInput(id, key)
    },
    toggle() {
      if (currentExpanded && currentExpanded[id])
        return deleteCurrentExpanded(id)

      return setCurrentExpanded(id, {})
    },
    toggleInput() {
      if (!key) throw new Error("(toggleInput) must connect this to an input")

      if (!currentExpanded) {
        return (allExpandedNodes[workflowManager.workflowName] = {
          [id]: {
            [key]: 1,
          },
        })
      }

      const newState = JSON.parse(JSON.stringify(currentExpanded))

      if (!currentExpanded[id]) newState[id] = { [key]: 1 }

      if (currentExpanded[id][key]) {
        delete newState[id][key]
      } else {
        newState[id][key] = 1
      }

      return (allExpandedNodes[workflowManager.workflowName] = newState)
    },
    save() {
      localStorage.setItem(KEY, JSON.stringify(allExpandedNodes))
    },
  }
}
