<script>
  let { workflowName, id, node } = $props()

  /**
   * auto open anchor if #node-{...} is in the URL
   *
   * btw, i lost so many fr*ckin' sanity points at this...
   * <details> open attribute has 2 events: onclick and ontoggle
   * - upon mount, if the `open` attribute is true, ontoggle is
   *   ALWAYS triggered
   *
   * controlling open state via JS is a pain in the ass, cba rn
   */
  const locationId = location.hash.replace(/^#node-/, "")
  const nodeOpen = locationId === id
  const graphInputsOpen = locationId === id
  const inputsOpen = locationId === id
  const outputsOpen = locationId === id

  import { connectNode, inputHasChanges } from "stores/workflows.svelte"
  const nodeStore = connectNode(workflowName, id)

  function shouldDisplayBadge(value) {
    if (typeof value === "number") return true
    if (typeof value === "string") return true
    if (Array.isArray(value)) return false // graph input/output
    return true
  }

  function badgeText(inputOrOutput) {
    const { value } = inputOrOutput
    if (typeof value === "number") return "Number"
    if (typeof value === "string") return "String"
    if (Array.isArray(value)) return "Node"
    return "?"
  }

  let titleText = $derived.by(() => {
    return `${id}. ${nodeStore.title}`
  })
</script>

<li class="flex-grow-0 max-w-full">
  <a href={`#node-${id}`} class="absolute top-0 -left-4 flex opacity-50 hover:opacity-100">
    <span class="text-base font-bold" class:text-primary={node.outputs.length}>#</span>
  </a>

  <details class="max-w-full" open={nodeOpen}>
    <summary class="ml-8" class:text-secondary={nodeStore.hasChanges}>{titleText}</summary>

    <ul>
      {#if node.graphInputs.length}
        <li>
          <details class="max-w-full" open={graphInputsOpen}>
            {@render subsection("Graph Inputs", node.graphInputs)}
          </details>
        </li>
      {/if}

      <li>
        <details class="max-w-full" open={inputsOpen}>
          {@render subsection("Inputs", node.inputs)}
        </details>
      </li>

      {#if node.outputs.length}
        <li>
          <details class="max-w-full" open={outputsOpen}>
            {@render subsection("Outputs", node.outputs)}
          </details>
        </li>
      {/if}
    </ul>
  </details>
</li>

{#snippet subsection(title, elements)}
  <summary
    class:text-secondary={title === "Inputs" && nodeStore.hasChanges}
    class:text-primary={title === "Outputs"}
  >
    <span>{title}</span>
    <span class="badge">{elements.length}</span>
  </summary>

  <ul>
    {#each elements as element}
      <li>
        <div>
          <code class="text-xs break-all"
            class:text-secondary={inputHasChanges(workflowName, id, element.key)}
            class:text-primary={title === "Outputs"}
          >{element.key}</code>
          {#if shouldDisplayBadge(element.value)}
            <span
              class="badge badge-sm badge-outline"
              class:badge-info={typeof element.value === "number"}
              class:badge-success={typeof element.value === "string"}
            >
              {badgeText(element)}
            </span>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
{/snippet}
