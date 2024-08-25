<script>
  let {
    selectedWorkflowName,
    selectedPage,
    drawerId = "workflowDrawer",
    selectEditPage,
    selectViewPage,
    selectWorkflowPage,
  } = $props()

  import { api } from "stores/api.svelte"
  import { connectWorkflow } from "stores/workflows.svelte"
  import { connectHistory } from "stores/execution.svelte"
  let workflowStore = $derived(connectWorkflow(selectedWorkflowName))
  let runner = $derived(connectHistory(selectedWorkflowName))

  import menuSvg from "assets/amburg.svg?raw"

  import runAndGoSvg from "assets/run-n-go.svg?raw"

  import editSvg from "assets/pencil.svg?raw"
  import viewSvg from "assets/eye.svg?raw"
  import workflowSvg from "assets/branch.svg?raw"

  async function runWorkflow() {
    const workflow = workflowStore.currentApi
    const result = await api.prompt(workflow)
    if (!result.prompt_id) return console.error("Failed to queue")

    runner.savePrompt({ workflow, result })

    const { prompt_id } = result

    let canPoll = true
    let pollDelay = 0
    let pollInterval = setInterval(async () => {
      if (!canPoll) return false
      canPoll = false

      const info = await api.history(prompt_id)
      // No api result yet
      if (!Object.keys(info).length) {
        if (pollDelay === 0) {
          pollDelay = 750
        } else {
          pollDelay = Math.round(pollDelay * 1.5)
        }

        return setTimeout(() => (canPoll = true), pollDelay)
      }

      runner.saveHistory(prompt_id, info[prompt_id].outputs)
      clearInterval(pollInterval)
    })
  }

  async function saveAndRun() {
    workflowStore.keepChanges()
    runWorkflow()
  }
</script>

<nav
  class="navbar z-10 gap-2 bg-base-100 bg-opacity-80 shadow-sm backdrop-blur-lg sticky top-0"
>
  <div class="justify-start">
    <label for={drawerId} class="btn btn-ghost btn-circle lg:hidden">
      {@html menuSvg}
    </label>
  </div>

  <div class="navbar-start">
    <button
      class="btn btn-sm btn-outline btn-success"
      disabled={!api.isIdle || workflowStore.hasChanges}
      onclick={runWorkflow}
    >
      Run Workflow
      {#if api.isRunning}
        <span class="loading loading-spinner"></span>
      {/if}
    </button>
    {#if workflowStore.hasChanges}
      <button
        class="btn btn-sm btn-circle btn-success w-12 ml-4"
        title="Save current changes and run the workflow."
        onclick={saveAndRun}
      >
        {@html runAndGoSvg}
      </button>
    {/if}
  </div>

  <div class="navbar-center">
    <ul class="menu menu-horizontal bg-base-200 rounded-box">
      <li>
        <button
          class="hover:text-base-content"
          class:bg-primary={selectedPage === "edit"}
          class:text-primary-content={selectedPage === "edit"}
          onclick={selectEditPage}>{@html editSvg}</button
        >
      </li>
      <li>
        <button
          class="hover:text-base-content"
          class:bg-primary={selectedPage === "view"}
          class:text-primary-content={selectedPage === "view"}
          onclick={selectViewPage}>{@html viewSvg}</button
        >
      </li>
      <li>
        <button
          class="hover:text-base-content"
          class:bg-primary={selectedPage === "workflow"}
          class:text-primary-content={selectedPage === "workflow"}
          onclick={selectWorkflowPage}>{@html workflowSvg}</button
        >
      </li>
    </ul>
  </div>

  {#if workflowStore.current}
    {#if workflowStore.hasChanges}
      <div class="navbar-end flex-grow gap-2">
        <button
          class="btn btn-sm btn-warning"
          onclick={workflowStore.keepChanges}>Save</button
        >
        <button
          class="btn btn-sm btn-outline btn-error"
          onclick={workflowStore.revertChanges}>Revert</button
        >
      </div>
    {/if}
  {/if}
</nav>
