/** save/load known workflows to localstorage */

const WORKFLOWS_KEY = "goodUI.stores.workflowManager.workflows"
const SELECTED_WORKFLOW_KEY = "goodUI.stores.workflowManager.workflowName"

let workflows = $state(JSON.parse(localStorage.getItem(WORKFLOWS_KEY) || "{}"))
let workflowName = $state(
  JSON.parse(localStorage.getItem(SELECTED_WORKFLOW_KEY || "")),
)

/** currently selected workflow from dropdown */
let current = $derived(workflows[workflowName])

export function connectWorkflowManager() {
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
    save() {
      localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows))
      localStorage.setItem(SELECTED_WORKFLOW_KEY, JSON.stringify(workflowName))
    },
  }
}
