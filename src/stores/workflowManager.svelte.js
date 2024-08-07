/** save/load known workflows to localstorage */

const WORKFLOWS_KEY = "goodUI.stores.workflowManager.workflows"
const WORKFLOW_NAME_KEY = "goodUI.stores.workflowManager.workflowName"
const WORKFLOW_CHANGES_KEY = "goodUI.stores.workflowManager.workflowChanges"

let workflows = $state(JSON.parse(localStorage.getItem(WORKFLOWS_KEY) || "{}"))
let workflowName = $state(
  JSON.parse(localStorage.getItem(WORKFLOW_NAME_KEY) || '""'),
)
let allChanges = $state(
  JSON.parse(localStorage.getItem(WORKFLOW_CHANGES_KEY) || "{}"),
)

/** currently selected workflow from dropdown */
let current = $derived(workflows[workflowName])
let changes = $derived(allChanges[workflowName])

function sameInputs(nodeId, inputKey) {
  let originalValue
  try {
    originalValue = workflows[workflowName][nodeId].inputs[inputKey]
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
    get workflows() {
      return workflows
    },
    set workflows(newFlows) {
      workflows = newFlows
    },
    get current() {
      return current
    },
    get inputValue() {
      if (!nodeId || !inputKey) throw new Error("Must connect with node+input")

      if (!changes) return ""
      if (!changes[nodeId]) return ""
      if (!Object.keys(changes[nodeId].inputs).length) return ""
      return changes[nodeId].inputs[inputKey] || ""
    },
    set inputValue(newValue) {
      if (!nodeId || !inputKey) throw new Error("Must connect with node+input")

      const newChanges = JSON.parse(JSON.stringify(changes || {}))

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

      if (!changes) return false
      if (!changes[id]) return false
      if (!changes[id].inputs) return false
      if (!changes[id].inputs[key]) return false
      return changes[id].inputs[key] !== current[id].inputs[key]
    },
    hasAnyModifiedInput(id = null) {
      id ||= nodeId
      if (!id) throw new Error("must specify nodeID")

      if (!changes) return false
      if (!changes[id]) return false
      if (!changes[id].inputs) return false
      return Object.entries(changes[id].inputs).some(([key, _v]) => {
        return !sameInputs(id, key)
      })
    },
    /** \b changed since last known write */
    get hasUnsavedChanges() {
      return JSON.stringify(workflows) !== localStorage.getItem(WORKFLOWS_KEY)
    },
    /** edits do not match active workflow state */
    get hasUncommittedChanges() {
      if (!changes) return false

      return (
        0 <
        Object.keys(changes).reduce((count, id) => {
          return (count += Object.keys(changes[id].inputs).filter((key) => {
            return !sameInputs(id, key)
          }).length)
        }, 0)
      )
    },
    /** set workflow back to localStorage state */
    revertWorkflow() {
      const orig = JSON.parse(localStorage.getItem(WORKFLOWS_KEY))
      workflows[workflowName] = orig[workflowName]
    },
    /** undo edits (back to committed workflow values) */
    revertChanges() {
      if (!changes) return
      allChanges[workflowName] = undoChanges(current, changes)
    },
    /** apply edits to workflow */
    commitChanges() {
      if (!changes) return

      const onlyChanges = keepChanges(current, changes)
      Object.entries(onlyChanges).forEach(([id, values]) => {
        Object.entries(values.inputs).forEach(([key, editValue]) => {
          current[id] ||= { inputs: {} }
          current[id].inputs[key] = editValue
        })
      })
    },
    save() {
      localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows))
      localStorage.setItem(WORKFLOW_NAME_KEY, JSON.stringify(workflowName))
      localStorage.setItem(
        WORKFLOW_CHANGES_KEY,
        JSON.stringify({
          ...allChanges,
          [workflowName]: removeBlankOrEqualChanges(current, changes),
        }),
      )
    },
    /** hacky fn so store values are updated */
    refresh() {
      workflows = JSON.parse(JSON.stringify(workflows))
      allChanges = JSON.parse(JSON.stringify(allChanges))
    },
  }
}
