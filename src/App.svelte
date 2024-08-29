<script>
  import Sidebar from "components/Sidebar"
  import Navbar from "components/Navbar"
  import EditPage from "components/EditPage"

  import PinnedInputs from "components/PinnedInputs"

  import workflowStore from "stores/workflows.svelte"
  let selectedIndex = $state(0)
  let selectedWorkflowName = $derived(
    workflowStore.workflowNames[selectedIndex],
  )

  function selectWorkflow(idx) {
    selectedIndex = idx
  }

  let selectedPage = $state("edit")
</script>

<main class="bg-base-100 drawer lg:drawer-open">
  <Sidebar {selectedWorkflowName} {selectWorkflow} />
  <div class="drawer-content">
    <Navbar
      {selectedPage}
      {selectedWorkflowName}
      selectEditPage={() => (selectedPage = "edit")}
      selectViewPage={() => (selectedPage = "view")}
      selectWorkflowPage={() => (selectedPage = "workflow")}
    />
    <div class="mx-4 flex">
      {#if workflowStore.workflowPins.length}
        <PinnedInputs workflowPins={workflowStore.workflowPins} />
      {/if}
      {#if selectedPage === "edit"}
        <EditPage {selectedWorkflowName} />
      {:else if selectedPage === "view"}
        <span>view :)</span>
      {:else if selectedPage === "workflow"}
        <span>wrkflw :)</span>
      {/if}
    </div>
  </div>
</main>
