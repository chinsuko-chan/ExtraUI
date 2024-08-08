// View state is specific to a component. Persists across refresh

const KEY = "goodUI.views.workflowEditor.allExpandedNodes"
const ALL_EXPANDED_GRAPH_OUTPUTS_KEY =
  "goodUI.views.workflowEditor.allExpandedGraphOutputs"

import { connectWorkflowManager } from "stores/workflowManager.svelte"
const workflowManager = connectWorkflowManager()

let allExpandedNodes = $state(JSON.parse(localStorage.getItem(KEY) || "{}"))
let allExpandedGraphOutputs = $state(
  JSON.parse(localStorage.getItem(ALL_EXPANDED_GRAPH_OUTPUTS_KEY) || "{}"),
)

let currentExpanded = $derived(allExpandedNodes[workflowManager.workflowName])
let currentExpandedGraphOutputs = $derived(
  allExpandedGraphOutputs[workflowManager.workflowName],
)

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

export function isExpandedOutput(nodeId, outputId) {
  if (!currentExpandedGraphOutputs) return false
  if (!currentExpandedGraphOutputs[nodeId]) return false
  return currentExpandedGraphOutputs[nodeId][outputId]
}

/** connect this to each node (at the child level) */
export function connectViewState(id, key = null, outputId = null) {
  return {
    get isExpandedInput() {
      if (!key)
        throw new Error("(isExpandedInput) must connect this to an input")
      return isExpandedInput(id, key)
    },
    get isExpanded() {
      if (outputId) {
        return isExpandedOutput(id, outputId)
      } else {
        if (!key) throw new Error("(isExpanded) must connect this to an input")
        return isExpandedInput(id, key)
      }
    },
    get expandedGraphOutputs() {
      if (!currentExpandedGraphOutputs) return {}
      return currentExpandedGraphOutputs[id] || {}
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

      /** @todo refactor so state isn't re-eval'd for every node */
      const newState = JSON.parse(JSON.stringify(currentExpanded))

      if (!currentExpanded[id]) newState[id] = { [key]: 1 }

      if (currentExpanded[id][key]) {
        delete newState[id][key]
      } else {
        newState[id][key] = 1
      }

      return (allExpandedNodes[workflowManager.workflowName] = newState)
    },
    toggleOutput() {
      if (!outputId)
        throw new Error("(toggleOutput) must connect this to an input")

      if (!currentExpandedGraphOutputs) {
        return (allExpandedGraphOutputs[workflowManager.workflowName] = {
          [id]: {
            [outputId]: 1,
          },
        })
      }

      if (!currentExpandedGraphOutputs[id]) {
        return (allExpandedGraphOutputs[workflowManager.workflowName][id] = {
          [outputId]: 1,
        })
      }

      if (isExpandedOutput(id, outputId)) {
        delete allExpandedGraphOutputs[workflowManager.workflowName][id][
          outputId
        ]
      } else {
        allExpandedGraphOutputs[workflowManager.workflowName][id][outputId] = 1
      }
    },
    save() {
      localStorage.setItem(KEY, JSON.stringify(allExpandedNodes))
      localStorage.setItem(
        ALL_EXPANDED_GRAPH_OUTPUTS_KEY,
        JSON.stringify(allExpandedGraphOutputs),
      )
    },
  }
}
