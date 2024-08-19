<script>
  import Sidebar from "components/Sidebar"
  import Navbar from "components/Navbar"
  import EditPage from "components/EditPage"

  import workflowStore from "stores/workflows.svelte"
  let selectedWorkflowName = $derived(workflowStore.workflowNames[0])

  let selectedTab = $state("edit")
</script>

<main class="bg-base-100 drawer lg:drawer-open">
  <Sidebar />
  <div class="drawer-content">
    <Navbar {selectedTab} {selectedWorkflowName} />
    <EditPage {selectedWorkflowName} />
  </div>
</main>

<style></style>
