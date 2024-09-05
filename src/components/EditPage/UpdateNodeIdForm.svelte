<script>
  let { workflowName, nodeId, closeModal } = $props()

  import wrk, { connectWorkflow, connectNode } from "stores/workflows.svelte"

  let workflow = $derived(connectWorkflow(workflowName).current)
  let node = $derived(connectNode(workflowName, nodeId))

  let value = $state((() => node.current.id)())

  function handleSave() {
    node.updateId(value.toString())
    closeModal()
  }

  let unchanged = $derived(value.toString() === node.current.id)
  let alreadyInUse = $derived.by(() => {
    // trusdst me its for ur own good
    return workflow?.nodes?.find(({ id }) => id === value.toString())
  })

  let alreadyInUseTitle = $derived.by(() => {
    return alreadyInUse?._meta?.title || alreadyInUse?.class_type
  })
</script>

<section>
  <h3 class="text-lg font-bold mb-2">Update Node ID</h3>

  <p class="mb-2">
    Reposition <code class="p-1 px-1.5 rounded-md bg-base-300 text-primary"
      >{node.title}</code
    > within ExtraUI by updating the ID. Unsure of the effects on ComfyUI's side.
  </p>

  <div class="grid gap-2">
    <span class="text-sm">
      Original ID:
      <code class="text-base font-bold">{node.current.id}</code>
    </span>

    <div class="form-control">
      <label class="max-w-sm input input-bordered flex items-center gap-2">
        <span>ID:</span>
        <input class="grow" bind:value type="number" min="1" />
      </label>
      {#if !unchanged && alreadyInUse}
        <div class="label">
          <span class="label-text text-error">
            That node ID is already used by {alreadyInUseTitle}
          </span>
        </div>
      {/if}
    </div>

    <div class="mr-auto flex gap-2">
      <button
        class="btn btn-sm btn-success btn-outline"
        disabled={unchanged || alreadyInUse}
        onclick={handleSave}>Save</button
      >
      <button class="btn btn-sm" onclick={closeModal}> Cancel </button>
    </div>
  </div>
</section>
