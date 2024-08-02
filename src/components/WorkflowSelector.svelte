<script>
  import { connectWorkflowManager } from "../stores/workflowManager.svelte"

  const manager = connectWorkflowManager()
</script>

<select class="select select-sm select-bordered w-full max-w-xs">
  {#if manager.workflows.length === 0}
    <option disabled selected>No workflows found</option>
  {:else}
    {#each manager.workflows as [name, obj], index}
      <option selected={index === manager.selectedIndex}>{name}</option>
    {/each}
  {/if}
</select>
