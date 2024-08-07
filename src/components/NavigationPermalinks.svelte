<script>
  import { onMount } from "svelte"
  let { nodeEntries } = $props()
  // sidebar shape:
  // node
  //     -> inputs
  //         -> (N items)
  //     -> outputs
  //         -> (N items)

  import { outputs } from "../stores/outputsManager.svelte"
  import { connectWorkflowManager } from "../stores/workflowManager.svelte"
  const manager = connectWorkflowManager()

  // shorthand, for convenience
  let outs = $derived(outputs.mostRecent)

  /**
   * @note INTENDED: only works on initial mount
   *       when clicking other href anchors, should not auto-expand them
   */
  let expandedId = $derived.by(() => {
    if (!location.hash) return ""

    return location.hash.replace(/^#node-/, "")
  })

  function shouldDisplayBadge(nodeValue) {
    if (typeof nodeValue === "number") return true
    if (typeof nodeValue === "string") return true
    if (Array.isArray(nodeValue)) return true
    return false
  }

  function displayText(nodeValue) {
    if (typeof nodeValue === "number") return "Number"
    if (typeof nodeValue === "string") return "String"
    if (Array.isArray(nodeValue)) return "Node" // <- confirm this
    throw new Error(`value not supported: ${nodeValue}`)
  }
</script>

{#snippet styledListItem(id, key, value)}
  <div>
    <code
      class="text-xs break-all"
      class:text-secondary={manager.isModifiedInput(id, key)}
    >{key}</code>
    {#if shouldDisplayBadge(value)}
      <span
        class="badge badge-sm badge-outline"
        class:badge-info={typeof value === "number"}
        class:badge-success={typeof value === "string"}
      >
        {displayText(value)}
      </span>
    {/if}
  </div>
{/snippet}

<menu class="menu px-4 py-2">
  {#each nodeEntries as [nodeId, node]}
    <li class="flex-grow-0 max-w-full">
      <a
        href={`#node-${nodeId}`}
        class="absolute top-0 flex hover:opacity-100"
        class:opacity-50={!outs[nodeId]}
      >
        <span class="text-base font-bold" class:text-primary={outs[nodeId]}
          >#</span
        >
      </a>
      <details class="max-w-full" open={expandedId === nodeId}>
        <summary
          class="ml-8"
          class:text-secondary={manager.hasAnyModifiedInput(nodeId)}
        >
          {nodeId}. {node._meta?.title || node.class_type}
        </summary>

        <ul>
          <li>
            <details class="max-w-full" open={expandedId === nodeId}>
              <summary class:text-secondary={manager.hasAnyModifiedInput(nodeId)}>
                {"Inputs "}
                <span
                  class="badge"
                >{Object.keys(node.inputs).length}</span>
              </summary>

              <ul>
                {#each Object.entries(node.inputs) as [keyName, value]}
                  <li>{@render styledListItem(nodeId, keyName, value)}</li>
                {/each}
              </ul>
            </details>
          </li>
          {#if outs[nodeId]}
            <li>
              <details class="max-w-full" open={expandedId === nodeId}>
                <summary class="text-primary">
                  {"Outputs "}
                  <span class="badge">{Object.keys(outs[nodeId]).length}</span>
                </summary>

                <ul>
                  {#each Object.entries(outs[nodeId]) as [keyName, _value]}
                    <li>
                      <code class="text-primary text-xs break-all">{keyName}</code>
                    </li>
                  {/each}
                </ul>
              </details>
            </li>
          {/if}
        </ul>
      </details>
    </li>
  {/each}
</menu>
