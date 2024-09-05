<script>
  let { workflowName, nodeType, inputs, id, expandedState, toggleInput } =
    $props()

  import Primitive from "./Primitive.svelte"
  import LoadImage from "./LoadImage.svelte"
</script>

{#if nodeType === "LoadImage"}
  <LoadImage {workflowName} {id} {inputs} />
{:else}
  <h3 class="font-bold mb-2">Inputs</h3>
  <ul class="flex flex-wrap">
    {#each inputs as { key, value }}
      <Primitive
        {workflowName}
        {id}
        {key}
        {value}
        {expandedState}
        {toggleInput}
      />
    {/each}
  </ul>
{/if}
