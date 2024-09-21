<script>
  import Sidebar from "components/Sidebar"
  import Navbar from "components/Navbar"
  import EditPage from "components/EditPage"

  import PinnedInputs from "components/PinnedInputs"

  import settings from "stores/settings.svelte"
  import workflowStore, { getWorkflow } from "stores/workflows.svelte"
  import { connectInput } from "stores/workflows.svelte"

  let selectedIndex = $state(0)
  let selectedWorkflowName = $derived(
    workflowStore.workflowNames[selectedIndex],
  )

  function selectWorkflow(idx) {
    selectedIndex = idx
  }

  let selectedPage = $state("edit")

  function quickPinAll() {
    const wfNodes = getWorkflow(selectedWorkflowName)?.nodes || []
    settings.quickPins.forEach((pinnedClass) => {
      wfNodes
        .filter((node) => {
          return node.class_type === pinnedClass
        })
        .forEach(({ id, inputs }) => {
          inputs.forEach(({ key }) => {
            connectInput(selectedWorkflowName, id, key).pin()
          })
        })
    })
  }
</script>

<main class="bg-base-100 drawer lg:drawer-open">
  <Sidebar {selectedPage} {selectedWorkflowName} {selectWorkflow} />
  <div class="drawer-content">
    <Navbar
      {selectedPage}
      {selectedWorkflowName}
      selectEditPage={() => (selectedPage = "edit")}
      selectWorkflowPage={() => (selectedPage = "workflow")}
      selectViewPage={() => (selectedPage = "view")}
    />
    <div>
      {#if selectedPage === "edit"}
        <header class="p-3 flex justify-between items-center">
          <h3 class="text-2xl font-bold">
            {selectedWorkflowName}
          </h3>

          <div class="flex gap-2">
            {#if settings.quickPins.length}
              <button class="btn btn-xs btn-outline" onclick={quickPinAll}
                >Quick-pin</button
              >
            {/if}
          </div>
        </header>
        <PinnedInputs
          workflowName={selectedWorkflowName}
          workflowPins={workflowStore.workflowPins}
        />
        <EditPage {selectedWorkflowName} />
      {:else if selectedPage === "view"}
        <span>view :)</span>
      {:else if selectedPage === "workflow"}
        <span>wrkflw :)</span>
      {/if}
    </div>
  </div>
</main>
