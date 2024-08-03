<script>
  import { connectWorkflowManager } from "../stores/workflowManager.svelte"

  const manager = connectWorkflowManager()

  /** @todo maybe something better than JSON.stringify */
  function formatInputs(inputsObject) {
    return Object.entries(inputsObject).map(([key, value]) => {
      return [key, JSON.stringify(value)]
    })
  }

  let nodeEntries = $derived(Object.entries(manager.current))

  /** @todo persist this? */
  let expandedNodes = $state({})

  function toggleNode(id) {
    expandedNodes[id] ? delete expandedNodes[id] : expandedNodes[id] = true
  }

  $inspect(manager.current)
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
          <button class="btn btn-outline btn-xs btn-circle" onclick={() => toggleNode(id)}>
            {id}
          </button>
        </div>
        <div class="timeline-end" class:timeline-box={expandedNodes[id]}>
          <section>
            <h2 id={`node-${id}`}>
              <a aria-hidden="true" tabindex="-1" href={`#node-${id}`}>
                <span
                  class="mr-1 opacity-20 hover:opacity-60 text-base font-bold inline-block align-middle relative -mt-1"
                  >#</span
                >
              </a>
              {node._meta.title}
            </h2>

            {#if expandedNodes[id]}
              <h3 class="font-bold">Inputs</h3>
              <ul>
                {#each formatInputs(node.inputs) as [key, val]}
                  {@render inputsListItem(key, val)}
                {/each}
              </ul>
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
