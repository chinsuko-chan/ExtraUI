<script>
  let { workflowName, nodeType, inputs, id } = $props()

  import Primitive from "./Primitive.svelte"
  import LoadImage from "./LoadImage.svelte"
</script>

{#if nodeType === "LoadImage"}
  <LoadImage {workflowName} {id} {inputs} />
{:else}
  <ul class="flex flex-wrap">
    {#each inputs as { key, value }}
      <Primitive {workflowName} {id} {key} {value} />
    {/each}
  </ul>
{/if}
