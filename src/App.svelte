<script>
  import { onMount } from "svelte"

  /** sidebar is visible at all times >lg */
  const DRAWER_ID = "drawer"
  import menuSvg from "./assets/amburg.svg?raw"
  import ghLogoSvg from "./assets/gh-logo.svg?raw"
  import twtSvg from "./assets/twiddr.svg?raw"

  import WorkflowSelector from "./components/WorkflowSelector.svelte"
  import WorkflowUploadButton from "./components/WorkflowUploadButton.svelte"
  import WorkflowContents from "./components/WorkflowContents.svelte"
  import WorkflowRunButton from "./components/WorkflowRunButton.svelte"
  import ApiConfigModal from "./components/ApiConfigModal.svelte"
  import NavigationPermalinks from "./components/NavigationPermalinks.svelte"

  import { connectWorkflowManager } from "./stores/workflowManager.svelte"
  import { api, STATUS } from "./stores/apiConnectionManager.svelte"

  let apiStatus = $derived.by(() => {
    if (api.status === STATUS.CONNECTING) return "Connecting"
    if (api.status === STATUS.IDLE) return "Connected"
    if (api.status === STATUS.RUNNING) return "Connected"

    return "Not connected"
  })
  let apiConfigModal = $state()

  const manager = connectWorkflowManager()
  let nodeEntries = $derived(Object.entries(manager.current || {}))

  onMount(() => {
    if (api.autoconnect) api.connect()
  })

  function confirmSave() {
    if (confirm(`This will update the inputs for "${manager.workflowName}", continue?`)) {
      manager.save()
      manager.refresh()
    }
  }

  function revertWorkflow() {
    manager.revertWorkflow() // 1
    manager.revertChanges() // 2 (uses values from step 1)
  }
</script>

{#snippet sidebar()}
  <header class="z-20 backdrop-blur-lg shadow-sm sticky top-0 p-4 grid grid-rows-2 gap-4">
    <div class="flex justify-between items-center gap-2">
      <h1 class="font-mono font-bold text-xl md:text-2xl">goodUI</h1>
      <button
        class="btn btn-xs btn-outline"
        class:btn-error={apiStatus === "Not connected"}
        class:btn-warning={apiStatus === "Connecting"}
        class:btn-success={apiStatus === "Connected"}
        onclick={() => apiConfigModal.showModal()}
      >
        {apiStatus}
      </button>
    </div>
    <div>
      <WorkflowUploadButton />
    </div>
  </header>
  <div class="flex-grow">
    <NavigationPermalinks nodeEntries={nodeEntries} />
  </div>
  <footer class="footer text-xs grid-rows-2 gap-2 p-4 px-8">
    <a class="link btn btn-sm btn-ghost font-normal flex items-center gap-2" href="https://github.com/chinsuko-chan/goodUI" target="_blank" rel="noopener">
      <span>{@html ghLogoSvg}</span>
      goodUI
    </a>
    <a class="link btn btn-sm btn-ghost font-normal flex items-center gap-2" href="https://x.com/chinsuko_chan" target="_blank" rel="noopener">
      <span>{@html twtSvg}</span>
      @chinsuko_chan
    </a>
  </footer>
{/snippet}

{#snippet navbar()}
  <nav class="navbar z-10 gap-2 bg-base-100 bg-opacity-80 shadow-sm backdrop-blur-lg sticky top-0">
    <div class="justify-start">
      <label for={DRAWER_ID} class="btn btn-ghost btn-circle lg:hidden">
        {@html menuSvg}
      </label>
    </div>

    <div class="navbar-center flex-grow gap-2">
      <WorkflowSelector />
      {#if manager.current}
        {#if manager.hasUncommittedChanges}
          <button
            class="btn btn-sm btn-ghost"
            onclick={manager.revertChanges}
          >Clear</button>
          <button
            class="btn btn-sm btn-outline btn-warning"
            onclick={manager.commitChanges}
          >Commit Changes</button>
        {:else if manager.hasUnsavedChanges}
          <button
            class="btn btn-sm btn-outline btn-error"
            onclick={revertWorkflow}
          >Revert</button>
          <button
            class="btn btn-sm btn-warning"
            onclick={confirmSave}
          >Save</button>
        {/if}
      {/if}
    </div>

    <div class="navbar-end">
      <WorkflowRunButton />
    </div>
  </nav>
{/snippet}

<div class="container mx-auto">
  <main class="bg-base-100 drawer lg:drawer-open">
    <input id={DRAWER_ID} type="checkbox" class="drawer-toggle" />

    <div class="drawer-side border-base-200 border-x border-l-0 z-10">
      <label for={DRAWER_ID} class="drawer-overlay"></label>
      <aside class="flex flex-col bg-base-100 min-h-screen w-80">
        {@render sidebar()}
      </aside>
    </div>

    <div class="drawer-content">
      {@render navbar()}
      <!-- tabs will go here -->
      <hr class="my-5 opacity-0">
      <WorkflowContents nodeEntries={nodeEntries} />
    </div>
  </main>
  <ApiConfigModal bind:apiConfigModal={apiConfigModal} />
</div>

<style>
  .drawer-side {
    scroll-behavior: smooth;
    scroll-padding-top: 5rem;
  }
</style>
