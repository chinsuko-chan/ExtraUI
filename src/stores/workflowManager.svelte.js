/** save/load known workflows to localstorage */

const WORKFLOW_NAME_KEY = "goodUI.stores.workflowManager.workflowName"
const ALL_WORKFLOWS_KEY = "goodUI.stores.workflowManager.allWorkflows"
const ALL_CHANGES_KEY = "goodUI.stores.workflowManager.allChanges"

let workflowName = $state(
  JSON.parse(localStorage.getItem(WORKFLOW_NAME_KEY) || '""'),
)
let allWorkflows = $state(
  JSON.parse(localStorage.getItem(ALL_WORKFLOWS_KEY) || "{}"),
)
let allChanges = $state(
  JSON.parse(localStorage.getItem(ALL_CHANGES_KEY) || "{}"),
)

/** currently selected workflow from dropdown */
let currentWorkflow = $derived(allWorkflows[workflowName])
let currentChanges = $derived(allChanges[workflowName])

function sameInputs(nodeId, inputKey) {
  let originalValue
  try {
    originalValue = allWorkflows[workflowName][nodeId].inputs[inputKey]
  } catch {
    console.warn(
      `Specified node+input combo does not exist for workflow ${workflowName}: (id = ${nodeId} , key = ${inputKey})`,
    )
    return false
  }

  return (
    JSON.stringify(originalValue) ===
    JSON.stringify(allChanges[workflowName][nodeId].inputs[inputKey])
  )
}

/**
 * given an edits object:
 * - keep input edits if they are exact matches
 * - reset input edits (back to workflow) if they do not match
 */
function undoChanges(original, edits) {
  if (!Object.keys(edits).length) return {}

  const newChanges = JSON.parse(JSON.stringify(edits))

  Object.entries(newChanges).forEach(([nodeId, values]) => {
    Object.entries(values.inputs).forEach(([inputKey, editValue]) => {
      // same = noop
      if (original[nodeId].inputs[inputKey] === editValue) return false

      // else use value from original
      newChanges[nodeId].inputs[inputKey] = original[nodeId].inputs[inputKey]
    })
  })

  return newChanges
}

/** keep input edits if they are NEW */
function keepChanges(original, edits) {
  if (!Object.keys(edits).length) return {}

  const newChanges = {}

  Object.entries(edits).forEach(([nodeId, values]) => {
    Object.entries(values.inputs).forEach(([inputKey, editValue]) => {
      if (original[nodeId].inputs[inputKey] === editValue) return false

      newChanges[nodeId] ||= { inputs: {} }
      newChanges[nodeId].inputs[inputKey] = editValue
    })
  })

  return newChanges
}

function removeBlankOrEqualChanges(original, edits) {
  const newChanges = {}
  // 1. equal
  Object.entries(edits).forEach(([nodeId, values]) => {
    Object.entries(values.inputs).forEach(([inputKey, editValue]) => {
      if (original[nodeId].inputs[inputKey] === editValue) return false

      // else
      newChanges[nodeId] ||= { inputs: {} }
      newChanges[nodeId].inputs[inputKey] = editValue
    })
  })

  // 2. empty
  Object.entries(newChanges).forEach(([nodeId, values]) => {
    Object.entries(values.inputs).forEach(([inputKey, editValue]) => {
      if (!Object.keys(newChanges[nodeId].inputs).length)
        return delete newChanges[nodeId]
    })
  })

  return newChanges
}

export function getNode(id) {
  if (!currentWorkflow) return
  return currentWorkflow[id]
}

/**
 * edits API:
 * - isModifiedInput: specified edit input != workflow input
 * - hasAnyModifiedInput: specified node has any changes
 * - hasUnsavedChanges: workflow != localStorage
 * - hasUncommittedChanges: edits != workflow
 * - revertChanges: reset edits where edits != workflow
 * - revertWorkflow: reset workflow to localStorage state
 * - commitChanges: set workflow where workflow == edits
 * - removeBlankOrEqualChanges: (self-explanatory)
 * - save: persist everything to localstorage
 */

export function connectWorkflowManager(nodeId = null, inputKey = null) {
  return {
    get workflowName() {
      return workflowName
    },
    set workflowName(newName) {
      workflowName = newName
    },
    get allWorkflows() {
      return allWorkflows
    },
    set allWorkflows(newFlows) {
      allWorkflows = newFlows
    },
    get currentWorkflow() {
      return currentWorkflow
    },
    get inputValue() {
      if (!nodeId || !inputKey) throw new Error("Must connect with node+input")

      if (!currentChanges) return ""
      if (!currentChanges[nodeId]) return ""
      if (!Object.keys(currentChanges[nodeId].inputs).length) return ""
      return currentChanges[nodeId].inputs[inputKey] || ""
    },
    set inputValue(newValue) {
      if (!nodeId || !inputKey) throw new Error("Must connect with node+input")

      const newChanges = JSON.parse(JSON.stringify(currentChanges || {}))

      newChanges[nodeId] ||= { inputs: {} }
      if (!newValue) {
        delete newChanges[nodeId].inputs[inputKey]
      } else {
        newChanges[nodeId].inputs[inputKey] = newValue
      }

      allChanges[workflowName] = newChanges
    },
    isModifiedInput(id = null, key = null) {
      id ||= nodeId
      if (!id) throw new Error("must specify nodeID")

      key ||= inputKey
      if (!key) throw new Error("must specify input")

      if (!currentChanges) return false
      if (!currentChanges[id]) return false
      if (!currentChanges[id].inputs) return false
      if (!currentChanges[id].inputs[key]) return false
      return currentChanges[id].inputs[key] !== currentWorkflow[id].inputs[key]
    },
    hasAnyModifiedInput(id = null) {
      id ||= nodeId
      if (!id) throw new Error("must specify nodeID")

      if (!currentChanges) return false
      if (!currentChanges[id]) return false
      if (!currentChanges[id].inputs) return false
      return Object.entries(currentChanges[id].inputs).some(([key, _v]) => {
        return !sameInputs(id, key)
      })
    },
    /** \b changed since last known write */
    get hasUnsavedChanges() {
      return (
        JSON.stringify(allWorkflows) !== localStorage.getItem(ALL_WORKFLOWS_KEY)
      )
    },
    /** edits do not match active workflow state */
    get hasUncommittedChanges() {
      if (!currentChanges) return false

      return (
        0 <
        Object.keys(currentChanges).reduce((count, id) => {
          return (count += Object.keys(currentChanges[id].inputs).filter(
            (key) => {
              return !sameInputs(id, key)
            },
          ).length)
        }, 0)
      )
    },
    /** set workflow back to localStorage state */
    revertWorkflow() {
      const orig = JSON.parse(localStorage.getItem(ALL_WORKFLOWS_KEY))
      allWorkflows[workflowName] = orig[workflowName]
    },
    /** undo edits (back to committed workflow values) */
    revertChanges() {
      if (!currentChanges) return
      allChanges[workflowName] = undoChanges(currentWorkflow, currentChanges)
    },
    /** apply edits to workflow */
    commitChanges() {
      if (!currentChanges) return

      const onlyChanges = keepChanges(currentWorkflow, currentChanges)
      Object.entries(onlyChanges).forEach(([id, values]) => {
        Object.entries(values.inputs).forEach(([key, editValue]) => {
          currentWorkflow[id] ||= { inputs: {} }
          currentWorkflow[id].inputs[key] = editValue
        })
      })
    },
    save() {
      localStorage.setItem(WORKFLOW_NAME_KEY, JSON.stringify(workflowName))
      localStorage.setItem(ALL_WORKFLOWS_KEY, JSON.stringify(allWorkflows))
      localStorage.setItem(
        ALL_CHANGES_KEY,
        JSON.stringify({
          ...allChanges,
          [workflowName]: removeBlankOrEqualChanges(
            currentWorkflow,
            currentChanges,
          ),
        }),
      )
    },
    /** hacky fn so store values are updated */
    refresh() {
      allWorkflows = JSON.parse(JSON.stringify(allWorkflows))
      allChanges = JSON.parse(JSON.stringify(allChanges))
    },
  }
}
