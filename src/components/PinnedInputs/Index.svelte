<script>
  let { workflowName, workflowPins } = $props()

  import PinnedInput from "./PinnedInput.svelte"

  let nodes = $derived.by(() => {
    return workflowPins.find(({ name }) => name === workflowName)?.nodes || []
  })
</script>

{#if nodes.length}
  <aside
    class="md:ml-3 p-2 bg-base-200/80 backdrop-blur-lg shadow rounded z-30 max-w-xl sticky top-16"
  >
    <div class="grid pinned-inputs-grid gap-x-2 gap-y-1">
      {#each nodes as { id, keys }}
        {#each keys as { key }, keyIndex}
          <PinnedInput {workflowName} {id} {key} {keyIndex} />
        {/each}
      {/each}
    </div>
  </aside>
{/if}

<style>
  aside {
    resize: both;
    overflow: scroll;
  }

  .pinned-inputs-grid {
    grid-template-columns: max-content fit-content(40%) 1fr min-content;
  }
</style>
