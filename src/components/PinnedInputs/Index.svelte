<script>
  let { workflowName, workflowPins } = $props()

  import PinnedInput from "./PinnedInput.svelte"

  let nodes = $derived.by(() => {
    return workflowPins.find(({ name }) => name === workflowName)?.nodes || []
  })
</script>

{#if nodes.length}
  <aside
    class="md:ml-3 p-2 bg-base-200/80 backdrop-blur-lg shadow rounded z-30 max-w-xl lg:max-w-full sticky top-16"
  >
    <div
      class="grid grid-flow-dense grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3"
    >
      {#each nodes as { id, keys }}
        <div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 mb-auto">
          {#each keys as { key }, keyIndex}
            <PinnedInput {workflowName} {id} {key} {keyIndex} />
          {/each}
        </div>
      {/each}
    </div>
  </aside>
{/if}

<style>
  aside {
    resize: vertical;
    overflow: scroll;
  }
</style>
