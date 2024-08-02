/** save/load known workflows to localstorage */

const WORKFLOWS_KEY = "goodUI.stores.workflowManager.workflows"
const SELECTED_INDEX_KEY = "goodUI.stores.workflowManager.selectedIndex"

export function connectWorkflowManager() {

  let workflows = $state(JSON.parse(localStorage.getItem(WORKFLOWS_KEY) || "[]"))
  let selectedIndex = $state(JSON.parse(localStorage.getItem(SELECTED_INDEX_KEY || "0")))

  /** currently selected workflow from dropdown */
  let current = $derived(workflows[selectedIndex])

  return {
    get workflows() {
      return workflows
    },
    get current() {
      return current
    },
    get selectedIndex() {
      return selectedIndex
    },
    save() {
      localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows))
    },
  }
}
