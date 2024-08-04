<script>
  import { api, STATUS } from "../stores/apiConnectionManager.svelte"

  let buttonMessage = $derived.by(() => {
    if (api.status === STATUS.IDLE) return "Run Workflow"
    if (api.status === STATUS.RUNNING) return "Busy"

    return "Not Connected"
  })
</script>

<button
  class="btn btn-sm btn-outline"
  class:btn-success={api.status === STATUS.IDLE}
  class:btn-warning={api.status === STATUS.RUNNING}
  class:btn-ghost={api.status !== STATUS.IDLE}
  disabled={api.status !== STATUS.IDLE}
>
  {buttonMessage}
</button>
