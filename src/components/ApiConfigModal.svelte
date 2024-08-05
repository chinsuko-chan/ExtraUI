<script>
  let { apiConfigModal = $bindable() } = $props()

  import { api, STATUS } from "../stores/apiConnectionManager.svelte"

  function updateIgnorelist(e) {
    const values = e.target.value.split(",").map((s) => s.trim())
    api.ignorelist = values
  }

  function tryConnect() {
    if (api.status === STATUS.DISCONNECTED) api.connect()
    if (api.status === STATUS.ERROR) api.connect()
    if (api.status === STATUS.CONNECTING) return
    if (api.status === STATUS.IDLE) api.disconnect()
    if (api.status === STATUS.RUNNING) api.disconnect()
  }

  let btnMessage = $derived.by(() => {
    if (api.status === STATUS.DISCONNECTED) return "Connect"
    if (api.status === STATUS.ERROR) return "Retry?"
    if (api.status === STATUS.CONNECTING) return "Connecting..."
    if (api.status === STATUS.IDLE) return "Disconnect"
    if (api.status === STATUS.RUNNING) return "Disconnect"
  })
</script>

<dialog bind:this={apiConfigModal} class="modal">
  <div class="modal-box">
    <div class="flex justify-between">
      <h3 class="text-lg font-bold mb-4">Connect to Comfy API</h3>
      <span
        class="badge badge-outline lowercase"
        class:badge-error={api.status === STATUS.DISCONNECTED ||
          api.status === STATUS.ERROR}
        class:badge-warning={api.status === STATUS.CONNECTING}
        class:badge-success={api.status === STATUS.IDLE ||
          api.status === STATUS.RUNNING}
      >
        {api.status}
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <label class="input input-sm input-ghost flex items-center gap-1">
        <span>http://</span>
        <input
          type="text"
          class="grow"
          placeholder="localhost:8188"
          bind:value={api.uri}
        />
      </label>
      <div class="form-control">
        <label class="label cursor-pointer">
          <span class="label-text">Autoconnect?</span>
          <input
            type="checkbox"
            class="toggle toggle-sm"
            class:toggle-success={api.autoconnect}
            bind:checked={api.autoconnect}
          />
        </label>
      </div>
      <label class="form-control">
        <div class="label">
          <span class="label-text">Ignored message types</span>
        </div>
        <textarea
          class="textarea textarea-bordered resize-none"
          placeholder="Eg. crystools.monitor,other-noisy-plugin"
          value={api.ignorelist.join(",")}
          onchange={updateIgnorelist}
        ></textarea>
        <div class="label">
          <span class="label-text-alt">Separate by commas</span>
        </div>
      </label>
    </div>
    <hr class="my-4" />
    <div>
      <button
        class="btn btn-sm btn-outline"
        class:btn-ghost={api.status === STATUS.CONNECTING}
        disabled={api.status === STATUS.CONNECTING}
        class:btn-error={api.status === STATUS.IDLE ||
          api.status === STATUS.RUNNING}
        onclick={tryConnect}
      >
        {btnMessage}
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
