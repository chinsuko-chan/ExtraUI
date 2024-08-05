<script>
  const KEY = "goodUI.views.workflowContentsExpandedNodes"

  import { connectWorkflowManager } from "../stores/workflowManager.svelte"
  import { api, STATUS } from "../stores/apiConnectionManager.svelte"
  import { runner } from "../stores/workflowRunnerManager.svelte"

  const manager = connectWorkflowManager()

  function formatTitle(nodeObject) {
    return nodeObject._meta?.title || nodeObject.class_type
  }

  /** @todo maybe something better than JSON.stringify */
  function formatInputs(inputsObject) {
    return Object.entries(inputsObject).map(([key, value]) => {
      return [key, JSON.stringify(value)]
    })
  }

  let nodeEntries = $derived(Object.entries(manager.current || {}))
  let allExpandedNodes = $state(JSON.parse(localStorage.getItem(KEY) || "{}"))

  /** @todo move to stores? annoying af here */
  let expandedState = {
    get current() {
      return allExpandedNodes[manager.workflowName] || {}
    },
    toggle(id) {
      const currentState = allExpandedNodes[manager.workflowName]

      if (!currentState) {
        return allExpandedNodes[manager.workflowName] = {
          [id]: 1
        }
      }

      if (currentState && currentState[id]) {
        delete allExpandedNodes[manager.workflowName][id]
      } else {
        allExpandedNodes[manager.workflowName][id] = 1
      }
    },
    save() {
      localStorage.setItem(KEY, JSON.stringify(allExpandedNodes))
    }
  }

  function toggleNode(id) {
    expandedState.toggle(id)
    expandedState.save()
  }

  let polling = -1
  let pollingDelay = 150
  let currentOutputs = $state({})
  let outputImages = $state({})

  function pollOutputs(lastRun) {
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
      formatImageQueries(rawOutputs).map(async ([nodeId, key, attributes]) => {
        const blob = await api.view(attributes)
        return [
          nodeId,
          key,
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

{#snippet inputsListItem(key, displayValue)}
  <li>
    <details class="collapse">
      <summary class="collapse-title p-2 min-h-8">
        <code class="btn btn-xs rounded-xl dark:border-base-content">{key}</code>
      </summary>
      <div class="collapse-content">
        <span>{displayValue}</span>
      </div>
    </details>
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
              <ul>
                {#each formatInputs(node.inputs) as [key, val]}
                  {@render inputsListItem(key, val)}
                {/each}
              </ul>
              {#if currentOutputs[id]}
                <h3 class="font-bold">Outputs</h3>
                <ul>
                  {#each formatInputs(currentOutputs[id]) as [key, val]}
                    {@render outputsListItem(id, key, val)}
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

<style lang="postcss">
  /* is there better way...? */
  details[open] {
    summary {
      code.btn {
        @apply border-secondary text-secondary bg-transparent;
      }
    }
  }
</style>
