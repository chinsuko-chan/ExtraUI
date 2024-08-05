<script>
  import { api, STATUS } from "../stores/apiConnectionManager.svelte"
  import { runner } from "../stores/workflowRunnerManager.svelte"

  let buttonMessage = $derived.by(() => {
    if (api.status === STATUS.IDLE) return "Run Workflow"
    if (api.status === STATUS.RUNNING) return "Busy"

    return "Not Connected"
  })

  async function tryQueue() {
    try {
      const resp = await runner.run()
      if (runner.lastRun?.prompt_id === resp.prompt_id)
        return console.warn("Workflow didn't run.")

      runner.push(resp)
      runner.save()
    } catch (e) {
      console.error(e)
    }
  }
</script>

<button
  class="btn btn-sm btn-outline"
  class:btn-success={api.status === STATUS.IDLE}
  class:btn-warning={api.status === STATUS.RUNNING}
  class:btn-ghost={api.status !== STATUS.IDLE}
  disabled={api.status !== STATUS.IDLE}
  onclick={tryQueue}
>
  {buttonMessage}
  {#if api.status === STATUS.RUNNING}
    <span class="loading loading-spinner"></span>
  {/if}
</button>
