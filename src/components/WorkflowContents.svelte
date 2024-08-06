<script>
  import InputContentEditor from "./InputContentEditor.svelte"

  import { connectWorkflowManager } from "../stores/workflowManager.svelte"
  import { api, STATUS } from "../stores/apiConnectionManager.svelte"
  import { runner } from "../stores/workflowRunnerManager.svelte"
  import { cache } from "../stores/imageCache.svelte"

  import { expandedState } from "../viewState/workflowContentsState.svelte"

  const manager = connectWorkflowManager()

  function formatTitle(nodeObject) {
    return nodeObject._meta?.title || nodeObject.class_type
  }

  let nodeEntries = $derived(Object.entries(manager.current || {}))

  function toggleNode(nodeId) {
    expandedState.toggleNode(nodeId)
    expandedState.save()
  }

  function toggleInput(nodeId, inputKey) {
    expandedState.toggleInput(nodeId, inputKey)
    expandedState.save()
  }

  let polling = -1
  let pollingDelay = 150
  let currentOutputs = $state({})
  let outputImages = $state({})

  function pollOutputs(lastRun) {
    if (!lastRun) return;
    currentOutputs = {} // clear outputs

    polling = setInterval(async () => {
      const info = await api.history(lastRun.prompt_id)
      if (!Object.keys(info).length) {
        pollingDelay *= 2 // simple backoff 4 now
        return // no result yet
      }

      currentOutputs = info[lastRun.prompt_id].outputs

      pollingDelay = 150 // reset
      clearInterval(polling)
    }, pollingDelay)
  }



  /** @todo cache with indexedDB */
  function formatImageQueries(rawOutputs) {
    // cba to work with deeply nested Promise.all rn
    const flattened = []
    Object.entries(rawOutputs).forEach(([nodeId, outputs]) => {
      Object.entries(outputs).forEach(([key, imagesArray]) => {
        imagesArray.forEach((attributes) => {
          flattened.push(
            [
              nodeId,
              key,
              attributes
            ]
          )
        })
      })
    })

    return flattened
  }

  async function pollImages(rawOutputs) {
    const out = {}
    const fmt = await Promise.all(
      formatImageQueries(rawOutputs).map(async ([nodeId, nodeKey, attributes], nodeOutputIdx) => {
        const dbValues = [
          manager.workflowName,
          nodeId,
          nodeKey,
          nodeOutputIdx,
          attributes.type,
          attributes.filename
        ]

        const cachedResult = await cache.getImage(dbValues.join("."))
        if (cachedResult) {
          return [
            cachedResult.nodeId,
            nodeKey,
            attributes.filename,
            URL.createObjectURL(cachedResult.blob)
          ]
        }

        // else, cache miss

        const blob = await api.view(attributes)
        await cache.saveImage(dbValues.join("."), ...dbValues, blob)

        return [
          nodeId,
          nodeKey,
          attributes.filename,
          URL.createObjectURL(blob)
        ]
      })
    )
    fmt.forEach(([id, key, fname, blob]) => {
      out[id] ||= {}
      out[id][key] ||= []
      out[id][key].push([fname, blob])
    })

    outputImages = out
  }

  /** poll when most recent run changes and idle */
  $effect(() => {
    if (api.status === STATUS.IDLE) return pollOutputs(runner.lastRun)
  })

  /** fetch images when output state changes */
  $effect(() => {
    if (Object.keys(currentOutputs).length) return pollImages(currentOutputs)
  })
</script>

{#snippet inputsListItem(id, key, value)}
  <li
    class:w-full={expandedState.isExpanded(id, key)}
    class:mb-4={expandedState.isExpanded(id, key)}
    class:border={expandedState.isExpanded(id, key)}
    class:border-neutral-content={expandedState.isExpanded(id, key)}
    class:shadow-xl={expandedState.isExpanded(id, key)}
    class:rounded-md={expandedState.isExpanded(id, key)}
  >
    <div
      class="collapse min-h-4 relative"
      class:collapse-arrow={expandedState.isExpanded(id, key)}
    >
      <input
        class={expandedState.isExpanded(id, key) ? null : "absolute inset hover:btn-outline"}
        type="checkbox"
        checked={expandedState.isExpanded(id, key)}
        onchange={() => toggleInput(id, key)}
      />
      <div
        class="collapse-title flex items-center min-h-4"
        class:p-2={!expandedState.isExpanded(id, key)}
        class:mb-4={expandedState.isExpanded(id, key)}
      >
        <code class={expandedState.isExpanded(id, key) ? null : "btn btn-xs dark:border-neutral-content"}>{key}</code>
      </div>
      {#if expandedState.isExpanded(id, key)}
        <div class="collapse-content">
          <InputContentEditor value={value} />
        </div>
      {/if}
    </div>
  </li>
{/snippet}

{#snippet outputsListItem(id, key, displayValue)}
  <li>
    <div class="flex flex-col gap-2 p-2">
      <code class="badge badge-outline badge-primary">{key}</code>
      <span>{displayValue}</span>
      <div>
        {#if outputImages[id] && outputImages[id][key] && outputImages[id][key].length}
          {#each outputImages[id][key] as [fname, src]}
            <img src={src} alt={fname}>
          {/each}
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
        <div class="timeline-middle">
          <button
            class="btn btn-xs btn-circle"
            class:btn-outline={!currentOutputs[id] || expandedState.current[id]}
            class:btn-primary={currentOutputs[id]}
            onclick={() => toggleNode(id)}>
            {id}
          </button>
        </div>
        <div
          class="timeline-end"
          class:ml-4={!expandedState.current[id]}
          class:timeline-box={expandedState.current[id]}
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
              {#if currentOutputs[id]}
                <h3 class="font-bold">Outputs</h3>
                <ul>
                  {#each Object.entries(currentOutputs[id]) as [key, val]}
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
