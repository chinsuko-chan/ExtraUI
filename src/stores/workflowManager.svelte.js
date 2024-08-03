/** save/load known workflows to localstorage */

const WORKFLOWS_KEY = "goodUI.stores.workflowManager.workflows"
const SELECTED_WORKFLOW_KEY =
  "goodUI.stores.workflowManager.selectedWorkflowName"

export function connectWorkflowManager() {
  let workflows = $state(
    JSON.parse(localStorage.getItem(WORKFLOWS_KEY) || "{}"),
  )
  let selectedWorkflowName = $state(
    JSON.parse(localStorage.getItem(SELECTED_WORKFLOW_KEY || "")),
  )

  /** currently selected workflow from dropdown */
  let current = $derived(workflows[selectedWorkflowName])

  return {
    get workflows() {
      return workflows
    },
    get current() {
      return current
    },
    get selectedWorkflowName() {
      return selectedWorkflowName
    },
    select(workflowName) {
      selectedWorkflowName = workflowName
    },
    save() {
      localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows))
      localStorage.setItem(
        SELECTED_WORKFLOW_KEY,
        JSON.stringify(selectedWorkflowName),
      )
    },
    update(newWorkflows) {
      workflows = newWorkflows
    },
  }
}
