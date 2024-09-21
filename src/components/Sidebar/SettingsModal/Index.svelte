<script>
  import QuickPinSettings from "./QuickPinSettings.svelte"

  import connectApi, { STATUS } from "stores/api.svelte"
  const api = connectApi()

  let configModal = $state()

  function updateIgnorelist(e) {
    const values = e.target.value.split(",").map((s) => s.trim())
    api.ignorelist = values
  }

  function toggleConnection() {
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

  let statusMessage = $derived.by(() => {
    if (api.status === STATUS.CONNECTING) return "Connecting"
    if (api.status === STATUS.IDLE) return "Connected"
    if (api.status === STATUS.RUNNING) return "Connected"

    return "Not connected"
  })

  let selectedModalTab = $state("api")
</script>

<button
  class="btn btn-xs btn-outline"
  class:btn-error={statusMessage === "Not connected"}
  class:btn-warning={statusMessage === "Connecting"}
  class:btn-success={statusMessage === "Connected"}
  onclick={() => configModal.showModal()}
>
  {statusMessage}
</button>

<dialog bind:this={configModal} class="modal">
  <div class="modal-box min-h-96">
    <div class="grid grid-cols-3 gap-2">
      <ul class="menu">
        <li><h2 class="menu-title">Settings</h2></li>
        <li>
          <button
            class:active={selectedModalTab === "api"}
            onclick={() => (selectedModalTab = "api")}>API</button
          >
        </li>
        <li>
          <button
            class:active={selectedModalTab === "quickPins"}
            onclick={() => (selectedModalTab = "quickPins")}>Quick Pins</button
          >
        </li>
        <li>
          <button
            class:active={selectedModalTab === "logs"}
            onclick={() => (selectedModalTab = "logs")}>Logs</button
          >
        </li>
        <li>
          <button
            class:active={selectedModalTab === "settings"}
            onclick={() => (selectedModalTab = "settings")}>Settings</button
          >
        </li>
      </ul>

      <div class="col-span-2">
        {#if selectedModalTab === "api"}
          <div class="flex justify-between">
            <h3 class="text-lg font-bold mb-4">Comfy API Config</h3>
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
            <div class="form-control">
              <div class="label">
                <span class="label-text">URL</span>
              </div>
              <label
                class="input input-bordered input-sm flex items-center gap-1"
              >
                <span>http://</span>
                <input
                  type="text"
                  class="grow"
                  placeholder="localhost:8188"
                  bind:value={api.uri}
                />
              </label>
            </div>
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
          </div>
          <hr class="my-4" />
          <div>
            <button
              class="btn btn-sm btn-outline"
              class:btn-ghost={api.status === STATUS.CONNECTING}
              disabled={api.status === STATUS.CONNECTING}
              class:btn-error={api.status === STATUS.IDLE ||
                api.status === STATUS.RUNNING}
              onclick={toggleConnection}
            >
              {btnMessage}
            </button>
          </div>
        {:else if selectedModalTab === "logs"}
          <h3 class="text-lg font-bold mb-4">Logs</h3>
          <p class="text-sm opacity-50">
            By default, all messages from the server will be logged to the
            console. Add values here based on the payload <code
              class="text-primary">type</code
            > to prevent them being logged. Feel free to ignore if you aren't a dev
            :)
          </p>
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
        {:else if selectedModalTab === "quickPins"}
          <QuickPinSettings />
        {:else if selectedModalTab === "settings"}
          <h3 class="text-lg font-bold mb-4">ExtraUI Settings</h3>

          <button
            class="btn btn-sm btn-outline btn-error"
            onclick={() => alert("not done ^^;")}
          >
            Clear Workflows
          </button>
        {/if}
      </div>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
