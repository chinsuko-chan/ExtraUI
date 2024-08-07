<script>
  import { onMount } from "svelte"

  let {
    id,
    node,
    index,
    finalIndex,
    expanded,
    outputs,
  } = $props()

  import { connectViewState } from "./viewState.svelte"
  const view = connectViewState(id)

  import NodeInput from "./NodeInput.svelte"
  import NodeOutput from "./NodeOutput.svelte"

  function formatTitle(nodeObject) {
    return nodeObject._meta?.title || nodeObject.class_type
  }

  function toggleNode() {
    view.toggle()
    view.save()
  }

  onMount(() => {
    if (!location.hash) return
    const node = document.querySelector(location.hash)
    /** @todo find proper fix... defer rendering until images loaded? */
    setTimeout(() => node.scrollIntoView(), 65) // 65ms found via the scientific method (brute force)
  })
</script>

{#snippet leadingHr()}
  {#if index !== 0}
    <hr />
  {/if}
{/snippet}

{#snippet trailingHr()}
  {#if index !== finalIndex}
    <hr />
  {/if}
{/snippet}

<li>
  {@render leadingHr()}
  <div class="timeline-middle">
    <button
      class="btn btn-xs btn-circle"
      class:btn-outline={!outputs || expanded}
      class:btn-primary={outputs}
      onclick={toggleNode}>
      {id}
    </button>
  </div>
  <div
    class="timeline-end border px-4 py-2"
    class:mb-0={!expanded}
    class:pb-0={!expanded}
    class:border-transparent={!expanded}
    class:timeline-box={expanded}
    class:w-full={expanded}
  >
    <section>
      <h2 id={`node-${id}`}>
        <a aria-hidden="true" tabindex="-1" href={`#node-${id}`}>
          <span
            class="mr-1 opacity-20 hover:opacity-60 text-base font-bold inline-block align-middle relative -mt-1"
            >#</span
          >
        </a>
        {formatTitle(node)}
      </h2>

      {#if expanded}
        <h3 class="font-bold">Inputs</h3>
        <ul class="flex flex-wrap">
          {#each Object.entries(node.inputs) as [key, originalValue]}
            <NodeInput {id} {key} {originalValue}/>
          {/each}
        </ul>
        {#if outputs}
          <h3 class="font-bold">Outputs</h3>
          <ul>
            {#each Object.entries(outputs) as [key, originalValue]}
              <NodeOutput {id} {key} {originalValue} />
            {/each}
          </ul>
        {/if}
      {/if}
    </section>
  </div>
  {@render trailingHr()}
</li>

<style>
  h2 {
    /* need confirm dis works on mobile */
    scroll-margin-top: 4.5rem;
  }
</style>
