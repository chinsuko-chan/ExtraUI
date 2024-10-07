<script>
  let { workflowName, workflowPins } = $props()

  import PinnedInput from "./PinnedInput.svelte"

  let nodes = $derived.by(() => {
    return workflowPins.find(({ name }) => name === workflowName)?.nodes || []
  })

  let maxWidthClasses = $derived.by(() => {
    if (nodes.length === 2) return "lg:max-w-4xl"
    if (nodes.length >= 3) return "lg:max-w-full"
    return ""
  })

  let colClasses = $derived.by(() => {
    if (nodes.length === 2) return "lg:grid-cols-2"
    if (nodes.length >= 3) return "lg:grid-cols-2 2xl:grid-cols-3"
    return ""
  })
</script>

{#if nodes.length}
  <aside
    class={`md:ml-3 p-2 bg-base-200/80 backdrop-blur-lg shadow rounded z-30 max-w-xl sticky top-16 ${maxWidthClasses}`}
  >
    <div class={`grid grid-flow-dense grid-cols-1 ${colClasses}`}>
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
