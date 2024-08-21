import localStore from "lib/localStore"
const WORKFLOW_HISTORY_KEY = "extraUI.stores.execution.workflowHistory"
const PROMPT_HISTORY_KEY = "extraUI.stores.execution.promptHistory"
const RESULT_HISTORY_KEY = "extraUI.stores.execution.resultHistory"

const localWorkflowHistory = localStore(WORKFLOW_HISTORY_KEY, {})
const localExecutionHistory = localStore(PROMPT_HISTORY_KEY, {})
const localResultHistory = localStore(RESULT_HISTORY_KEY, {})

let executionHistory = $state(localExecutionHistory.current)
let workflowHistory = $state(localWorkflowHistory.current) // should prob save the delta instead...
let resultHistory = $state(localResultHistory.current)

export function connectHistory(workflowName) {
  return {
    get history() {
      return executionHistory[workflowName] || []
    },
    get results() {
      return resultHistory[workflowName] || []
    },
    /** save workflow + response from `POST /prompt` */
    savePrompt({ workflow, result }) {
      const { prompt_id } = result // uuid so unique

      executionHistory[workflowName] ||= []
      workflowHistory[workflowName] ||= []

      executionHistory[workflowName].unshift([prompt_id, result])
      workflowHistory[workflowName].unshift([prompt_id, workflow])

      localExecutionHistory.save(executionHistory)
      localWorkflowHistory.save(workflowHistory)
    },
    /** save result from `GET /history` (by prompt_id) */
    saveHistory(promptId, outputs) {
      resultHistory[workflowName] ||= []
      resultHistory[workflowName].unshift([promptId, outputs])
      localResultHistory.save(resultHistory)
    },
  }
}
