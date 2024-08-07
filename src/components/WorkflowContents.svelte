<script>
  let { nodeEntries } = $props()

  import { connectWorkflowManager } from "../stores/workflowManager.svelte"
  import { runner } from "../stores/workflowRunnerManager.svelte"
  import { outputs } from "../stores/outputsManager.svelte"

  import { expandedState } from "../viewState/workflowContentsState.svelte"

  import InputContentEditor from "./InputContentEditor.svelte"

  const manager = connectWorkflowManager()

  function formatTitle(nodeObject) {
    return nodeObject._meta?.title || nodeObject.class_type
  }

  function toggleNode(nodeId) {
    expandedState.toggleNode(nodeId)
    expandedState.save()
  }

  function toggleInput(nodeId, inputKey) {
    expandedState.toggleInput(nodeId, inputKey)
    expandedState.save()
  }

  // hacky solution to auto-fetch latest images... it works tho
  let previousImages = ""

  /** poll when most recent run changes */
  $effect(() => {
    if (runner?.lastRun?.prompt_id)
      return outputs.poll(runner.lastRun.prompt_id)
  })


  /** fetch images when output state changes */
  $effect(() => {
    if (!outputs.mostRecentFilenames.length) return


    if (previousImages !== JSON.stringify(outputs.mostRecentFilenames)) {
      outputs.pollImages(outputs.mostRecent)
      previousImages = JSON.stringify(outputs.mostRecentFilenames)
    }
  })

  let canScroll = $state(true)

  /** focus node on first mount, AFTER inputs are expanded */
  $effect(() => {
    if (!canScroll) return
    if (!location.hash) return canScroll = false
    const node = document.querySelector(location.hash)
    if (node) {
      canScroll = false
      /** @todo i think proper fix by decoupling initial expanded state on mount */
      setTimeout(() => node.scrollIntoView(), 65) // 65ms found via the scientific method (brute force)
    }
  })
</script>

{#snippet inputsListItem(id, key, value)}
  <li
    class:w-full={expandedState.isExpanded(id, key)}
    class:mb-4={expandedState.isExpanded(id, key)}
    class:border={expandedState.isExpanded(id, key)}
    class:border-secondary={expandedState.isExpanded(id, key) && manager.isModifiedInput(id, key)}
    class:shadow-md={expandedState.isExpanded(id, key)}
    class:rounded-md={expandedState.isExpanded(id, key)}
  >
    <div
      class="collapse min-h-4 relative"
      class:collapse-arrow={expandedState.isExpanded(id, key)}
    >
      <input
        class={expandedState.isExpanded(id, key) ? null : "absolute inset"}
        type="checkbox"
        checked={expandedState.isExpanded(id, key)}
        onchange={() => toggleInput(id, key)}
      />
      <div
        class="collapse-title flex items-center min-h-4 hover:bg-primary"
        class:p-2={!expandedState.isExpanded(id, key)}
        class:mb-4={expandedState.isExpanded(id, key)}
      >
        <code
          class={manager.isModifiedInput(id, key) ? null : "dark:border-neutral-content"}
          class:btn={!expandedState.isExpanded(id, key)}
          class:btn-xs={!expandedState.isExpanded(id, key)}
          class:btn-outline={manager.isModifiedInput(id, key)}
          class:btn-secondary={manager.isModifiedInput(id, key)}
        >{key}</code>
      </div>
      {#if expandedState.isExpanded(id, key)}
        <div class="collapse-content">
          <InputContentEditor
            nodeId={id}
            inputKey={key}
            originalValue={value}
          />
        </div>
      {/if}
    </div>
  </li>
{/snippet}

{#snippet outputsListItem(id, key, displayValue)}
  <li>
    <div class="flex flex-col gap-2 p-2">
      <code class="badge badge-outline badge-primary">{key}</code>
      <div>
        {#if outputs.mostRecentImages[id] && outputs.mostRecentImages[id][key] && outputs.mostRecentImages[id][key].length}
        {#each outputs.mostRecentImages[id][key] as [fname, src]}
            <img src={src} alt={fname}>
          {/each}
        {:else}
          <!-- ambiguous element... curious... -->
          <div class="bg-base-200 w-full px-4 py-2 rounded-md break-all">
            <code class="text-sm">{displayValue}</code>
          </div>
        {/if}
      </div>
    </div>
  </li>
{/snippet}

{#snippet leadingHr(index)}
  {#if index !== 0}
    <hr />
  {/if}
{/snippet}

{#snippet trailingHr(length, index)}
  {#if length - 1 !== index}
    <hr />
  {/if}
{/snippet}


<article class="mx-6 mb-16 xl:mr-2">
  <ul class="timeline timeline-vertical timeline-snap-icon timeline-compact">
    {#each nodeEntries as [id, node], index}
      <li>
        {@render leadingHr(index)}
        <div
          class="timeline-middle"
        >
          <button
            class="btn btn-xs btn-circle"
            class:btn-outline={!outputs.mostRecent[id] || expandedState.current[id]}
            class:btn-primary={outputs.mostRecent[id]}
            onclick={() => toggleNode(id)}>
            {id}
          </button>
        </div>
        <div
          class="timeline-end border px-4 py-2"
          class:mb-0={!expandedState.current[id]}
          class:pb-0={!expandedState.current[id]}
          class:border-transparent={!expandedState.current[id]}
          class:timeline-box={expandedState.current[id]}
          class:w-full={Object.keys(expandedState.current[id] || {}).length}
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

            {#if expandedState.current[id]}
              <h3 class="font-bold">Inputs</h3>
              <ul class="flex flex-wrap">
                {#each Object.entries(node.inputs) as [key, val]}
                  {@render inputsListItem(id, key, val)}
                {/each}
              </ul>
              {#if outputs.mostRecent[id]}
                <h3 class="font-bold">Outputs</h3>
                <ul>
                  {#each Object.entries(outputs.mostRecent[id]) as [key, val]}
                    {@render outputsListItem(id, key, JSON.stringify(val))}
                  {/each}
                </ul>
              {/if}
            {/if}
          </section>
        </div>
        {@render trailingHr(nodeEntries.length, index)}
      </li>
    {/each}
  </ul>
</article>

<style>
  h2 {
    /* need confirm dis works on mobile */
    scroll-margin-top: 4.5rem;
  }
</style>
