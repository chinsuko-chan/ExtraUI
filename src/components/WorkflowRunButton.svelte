<script>
  import { api, STATUS } from "../stores/apiConnectionManager.svelte"
  import { runner } from "../stores/workflowRunnerManager.svelte"
  import { connectWorkflowManager } from "../stores/workflowManager.svelte"

  import runAndGoSvg from "../assets/run-n-go.svg?raw"

  const manager = connectWorkflowManager()

  let buttonMessage = $derived.by(() => {
    if (api.status === STATUS.IDLE) return "Run Workflow"
    if (api.status === STATUS.RUNNING) return "Busy"

    return "Not Connected"
  })

  async function tryQueue() {
    try {
      const resp = await runner.run()
      if (!resp || runner.lastRun?.prompt_id === resp.prompt_id)
        return console.warn("Workflow didn't run.")

      runner.push(resp)
      runner.save()
    } catch (e) {
      console.error(e)
    }
  }

  let mainButtonDisabled = $derived.by(() => {
    if (api.status !== STATUS.IDLE) return true

    return manager.hasUncommittedChanges
  })

  function commitAndRun() {
    manager.commitChanges()
    tryQueue()
  }
</script>

{#if manager.hasUncommittedChanges}
  <button
    class="btn btn-ghost btn-circle border-0 mr-4"
    title="Commit current changes and run the workflow."
    onclick={commitAndRun}
  >
    {@html runAndGoSvg}
  </button>
{/if}
<button
  class="btn btn-sm btn-outline"
  class:btn-success={api.status === STATUS.IDLE}
  class:btn-warning={api.status === STATUS.RUNNING}
  disabled={mainButtonDisabled}
  onclick={tryQueue}
>
  {buttonMessage}
  {#if api.status === STATUS.RUNNING}
    <span class="loading loading-spinner"></span>
  {/if}
</button>
