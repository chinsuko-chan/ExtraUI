<script>
  import { connectWorkflowManager } from "../stores/workflowManager.svelte"

  const manager = connectWorkflowManager()

  function onchange(e) {
    manager.workflowName = e.target.value
    manager.save()
  }
</script>

<select class="select select-sm select-bordered w-full max-w-xs" {onchange}>
  {#if !Object.keys(manager.workflows).length}
    <option disabled selected>No workflows found</option>
  {:else}
    <option disabled selected>Select a workflow</option>
    {#each Object.entries(manager.workflows) as [name, _obj]}
      <option selected={name === manager.workflowName}>{name}</option>
    {/each}
  {/if}
</select>
