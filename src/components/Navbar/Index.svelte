<script>
  let {
    selectedWorkflowName,
    selectedTab,
    drawerId = "workflowDrawer",
  } = $props()

  import { connectWorkflow } from "stores/workflows.svelte"
  const workflowStore = connectWorkflow(selectedWorkflowName)

  import menuSvg from "assets/amburg.svg?raw"

  import runAndGoSvg from "assets/run-n-go.svg?raw"

  import editSvg from "assets/pencil.svg?raw"
  import viewSvg from "assets/eye.svg?raw"
  import workflowSvg from "assets/branch.svg?raw"
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
    <button class="btn btn-sm btn-outline btn-success"> Run Workflow </button>
    <button
      class="btn btn-ghost btn-circle border-0 ml-4"
      title="Commit current changes and run the workflow."
    >
      {@html runAndGoSvg}
    </button>
  </div>

  <div class="navbar-center">
    <ul class="menu menu-horizontal bg-base-200 rounded-box">
      <li>
        <button
          class="hover:text-base-content"
          class:bg-primary={selectedTab === "edit"}
          class:text-primary-content={selectedTab === "edit"}
          >{@html editSvg}</button
        >
      </li>
      <li>
        <button
          class="hover:text-base-content"
          class:bg-primary={selectedTab === "view"}
          class:text-primary-content={selectedTab === "view"}
          >{@html viewSvg}</button
        >
      </li>
      <li>
        <button
          class="hover:text-base-content"
          class:bg-primary={selectedTab === "workflow"}
          class:text-primary-content={selectedTab === "workflow"}
          >{@html workflowSvg}</button
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
