<script>
  let { selectedWorkflowName } = $props()

  import Node from "./Node.svelte"
  import RenameNodeForm from "./RenameNodeForm.svelte"

  import { connectHistory } from "stores/execution.svelte"

  let nodeConfigModal

  // todo: move this to workflows store?
  let executions = $derived(connectHistory(selectedWorkflowName))
  let allResults = $derived(executions.results)
  let mostRecentOutputs = $derived.by(() => {
    return allResults[0]?.[1] || {}
  })

  import { connectWorkflow } from "stores/workflows.svelte"
  let workflowStore = $derived(connectWorkflow(selectedWorkflowName))

  let nodes = $derived(workflowStore.current?.nodes || [])

  // renameNode, updateNodeId
  let modalAction = $state()
  let selectedNodeId = $state()

  function openModal(actionName, nodeId) {
    modalAction = actionName
    selectedNodeId = nodeId
    nodeConfigModal.showModal()
  }

  function closeModal() {
    modalAction = null
    nodeConfigModal.close()
  }
</script>

<article class="mx-3 md:ml-8">
  <!-- weird ahh overflow bug on mobile -->
  <ul class="py-3 overflow-x-hidden md:overflow-x-auto">
    {#each nodes as node, index}
      <Node
        workflowName={selectedWorkflowName}
        id={node.id}
        {node}
        {index}
        finalIndex={nodes.length - 1}
        graphInputs={node.graphInputs}
        inputs={node.inputs}
        graphOutputs={node.graphOutputs}
        outputs={mostRecentOutputs[node.id] || []}
        openRenameModal={(nodeId) => openModal("renameNode", nodeId)}
        openUpdateNodeIdModal={(nodeId) => openModal("updateNodeId", nodeId)}
      />
    {/each}
  </ul>

  <dialog bind:this={nodeConfigModal} class="modal">
    <div class="modal-box">
      {#if modalAction === "renameNode"}
        <RenameNodeForm
          workflowName={selectedWorkflowName}
          nodeId={selectedNodeId}
          {closeModal}
        />
      {:else if modalAction === "updateNodeId"}
        <span>update id</span>
      {/if}
    </div>
    <form method="dialog" class="modal-backdrop">
      <button onclick={closeModal}>close</button>
    </form>
  </dialog>
</article>
