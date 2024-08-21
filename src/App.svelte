<script>
  import Sidebar from "components/Sidebar"
  import Navbar from "components/Navbar"
  import EditPage from "components/EditPage"

  import { api } from "stores/api.svelte"
  import workflowStore from "stores/workflows.svelte"
  let selectedWorkflowName = $derived(workflowStore.workflowNames[0])

  let selectedPage = $state("edit")

  let fileUpload

  async function logFile() {
    console.log("uploading", fileUpload.files)
    const result = await api.uploadImage({ image: fileUpload.files[0] })

    console.log("GOT DIS!", result)
  }
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
    <input bind:this={fileUpload} type="file" onchange={logFile} />
    {#if selectedPage === "edit"}
      <EditPage {selectedWorkflowName} />
    {:else if selectedPage === "view"}
      <span>view :)</span>
    {:else if selectedPage === "workflow"}
      <span>wrkflw :)</span>
    {/if}
  </div>
</main>
