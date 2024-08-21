<script>
  import Sidebar from "components/Sidebar"
  import Navbar from "components/Navbar"
  import EditPage from "components/EditPage"

  import workflowStore from "stores/workflows.svelte"
  let selectedWorkflowName = $derived(workflowStore.workflowNames[0])

  let selectedPage = $state("edit")
</script>

<main class="bg-base-100 drawer lg:drawer-open">
  <Sidebar />
  <div class="drawer-content">
    <Navbar
      {selectedPage}
      {selectedWorkflowName}
      selectEditPage={() => (selectedPage = "edit")}
      selectViewPage={() => (selectedPage = "view")}
      selectWorkflowPage={() => (selectedPage = "workflow")}
    />
    {#if selectedPage === "edit"}
      <EditPage {selectedWorkflowName} />
    {:else if selectedPage === "view"}
      <span>view :)</span>
    {:else if selectedPage === "workflow"}
      <span>wrkflw :)</span>
    {/if}
  </div>
</main>
