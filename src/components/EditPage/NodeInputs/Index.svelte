<script>
  let { workflowName, nodeType, inputs, id } = $props()

  import Primitive from "./Primitive.svelte"
</script>

{#if nodeType === "LoadImage"}
  <span>Load image!!!</span>
{:else}
  {#each inputs as { key, value }}
    <Primitive {workflowName} {id} {key} {value} />
  {/each}
{/if}
