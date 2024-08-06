/** save/load known workflows to localstorage */

const WORKFLOWS_KEY = "goodUI.stores.workflowManager.workflows"
const WORKFLOW_NAME_KEY = "goodUI.stores.workflowManager.workflowName"
const WORKFLOW_EDITS_KEY = "goodUI.stores.workflowManager.workflowEdits"

let workflows = $state(JSON.parse(localStorage.getItem(WORKFLOWS_KEY) || "{}"))
let workflowName = $state(
  JSON.parse(localStorage.getItem(WORKFLOW_NAME_KEY) || ""),
)
let workflowEdits = $state(
  JSON.parse(localStorage.getItem(WORKFLOW_EDITS_KEY) || "{}"),
)

/** currently selected workflow from dropdown */
let current = $derived(workflows[workflowName])

export function connectWorkflowManager(nodeId = null, inputKey = null) {
  return {
    get workflows() {
      return workflows
    },
    set workflows(newFlows) {
      workflows = newFlows
    },
    get current() {
      return current
    },
    get workflowName() {
      return workflowName
    },
    set workflowName(newName) {
      workflowName = newName
    },
    get inputValue() {
      if (!nodeId && !inputKey)
        throw new Error("Error: connected without node+input info")

      if (!workflowEdits[nodeId]) return ""
      return workflowEdits[nodeId][inputKey] || ""
    },
    set inputValue(newValue) {
      if (!nodeId && !inputKey)
        throw new Error("Error: connected without node+input info")

      workflowEdits[nodeId] ||= {}
      if (!newValue || newValue === "") {
        delete workflowEdits[nodeId][inputKey]
      } else {
        workflowEdits[nodeId][inputKey] = newValue
      }
    },
    /** @returns boolean */
    hasModifiedInput(id, key) {
      if (!workflowEdits[id]) return false
      if (!workflowEdits[id][key]) return false
      return true
    },
    /** returns the actual value or errs */
    getModifiedInput(id, key) {
      return workflowEdits[id][key]
    },
    save() {
      localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows))
      localStorage.setItem(WORKFLOW_NAME_KEY, JSON.stringify(workflowName))
      localStorage.setItem(WORKFLOW_EDITS_KEY, JSON.stringify(workflowEdits))
    },
  }
}
