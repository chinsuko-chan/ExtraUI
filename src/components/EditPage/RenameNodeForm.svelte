<script>
  let { workflowName, nodeId, closeModal } = $props()

  import workflow, { connectNode } from "stores/workflows.svelte"
  let node = $derived(connectNode(workflowName, nodeId))

  let value = $state((() => node.title)())

  function handleSave() {
    node.title = value
    closeModal()
    workflow.save()
  }
</script>

<section>
  <h3 class="text-lg font-bold mb-2">Rename Node ({nodeId})</h3>

  <div class="grid gap-2">
    <input class="input input-sm input-bordered" bind:value type="text" />

    <div class="mr-auto flex gap-2">
      <button
        class="btn btn-sm btn-success btn-outline"
        disabled={node.title === value}
        onclick={handleSave}>Save</button
      >
      <button class="btn btn-sm" onclick={closeModal}> Cancel </button>
    </div>
  </div>
</section>
