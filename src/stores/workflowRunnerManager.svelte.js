import { connectWorkflowManager } from "./workflowManager.svelte"
import { api } from "./apiConnectionManager.svelte"

const HISTORY_KEY = "goodUI.stores.workflowRunnerManager.history"

const workflow = connectWorkflowManager()

/** @note history saved by workflow name */
let history = $state(JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}"))
let lastRun = $derived.by(() => {
  const flow = history[workflow.workflowName] || []
  return flow[flow.length - 1]
})

export const runner = {
  /** queue 1 prompt at a time */
  async run() {
    if (!api.isIdle) return console.warn("Skipping execution, not idle.")
    /** @note not compatible with i2i workflows yet */
    const queueResult = await api.prompt(workflow.current)
    if (!queueResult.prompt_id) return {}

    return queueResult
  },
  get history() {
    return history
  },
  get lastRun() {
    return lastRun
  },
  push(result) {
    history[workflow.workflowName] ||= []
    history[workflow.workflowName].push(result)
  },
  save() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  },
}
