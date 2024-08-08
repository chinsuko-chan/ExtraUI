<script>
  import { onMount } from "svelte"

  /** these are here basically for my own reference at this point, im going crazy */
  const FROM_TOOLTIP_TEXT = `These are the IDs of nodes with incoming connections to ${formatTitle(node)}.`
  const TO_TOOLTIP_TEXT = `${formatTitle(node)} outputs to these nodes.`

  let {
    id,
    node,
    index,
    finalIndex,
    expanded,
    outputs,
  } = $props()

  import { connectWorkflowManager, getNode } from "stores/workflowManager.svelte"
  import { connectViewState, isExpandedInput } from "./viewState.svelte"
  const manager = connectWorkflowManager()
  const view = connectViewState(id)

  import NodeConnection from "./NodeConnection.svelte"
  import NodeInput from "./NodeInput.svelte"
  import NodeOutput from "./NodeOutput.svelte"

  function formatTitle(nodeObject) {
    return nodeObject._meta?.title || nodeObject.class_type
  }

  function toggleNode() {
    view.toggle()
    view.save()
  }

  let { graphInputs, inputs } = $derived.by(() => {
    return Object.entries(node.inputs).reduce((partitionedOutput, [key, originalValue]) => {
      partitionedOutput[Array.isArray(originalValue) ? "graphInputs" : "inputs"].push([key, originalValue])
      return partitionedOutput
    }, { graphInputs: [], inputs: [] })
  })

  let expandedGraphInputs = $derived.by(() => {
    return graphInputs.filter(([key, _val]) => {
      return isExpandedInput(id, key)
    })
  })

  let expandedGraphOutputs = $derived(Object.entries(view.expandedGraphOutputs))

  /**
   * @shape [targetNodeId: string, inputKey: string][]
   * @example [[ "9", "images" ]] <- Node 9 is the target, the graph input label is "images"
   */
  let graphOutputs = Object.entries(manager.currentWorkflow).reduce((out, [nodeId, values]) => {
    if (!values.inputs) return out
    Object.entries(values.inputs ).forEach(([inputKeyName, value]) => {
      if (!Array.isArray(value)) return
      if (value[0] === id) out.push([nodeId, inputKeyName])
    })
    return out
  }, [])

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
      class:btn-outline={expanded}
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
      <h2 id={`node-${id}`} class:mb-2={expanded}>
        <a aria-hidden="true" tabindex="-1" href={`#node-${id}`}>
          <span
            class="mr-1 opacity-20 hover:opacity-60 text-base font-bold inline-block align-middle relative -mt-1"
            >#</span
          >
        </a>
        {formatTitle(node)}
      </h2>

      {#if expanded}
        <div class="flex flex-nowrap gap-4">
          {#if graphInputs.length}
            <div>
              <ul class="flex flex-col gap-2 items-center">
                {#each graphInputs as [key, originalValue]}
                  <NodeConnection
                    {id}
                    {key}
                    title={formatTitle(getNode(originalValue[0]))}
                    connectionId={originalValue[0]}
                  />
                {/each}
              </ul>
            </div>
          {/if}
          <div class="flex-grow">
            {#if expandedGraphInputs.length || expandedGraphOutputs.length}
              <div class="flex justify-between">
                {#if expandedGraphInputs.length}
                  <div>
                    <h3 class="font-bold mb-2">Graph Inputs</h3>
                    <table class="table table-xs w-auto">
                      <thead>
                        <tr>
                          <th class="tooltip tooltip-right" data-tip={FROM_TOOLTIP_TEXT}>ID</th>
                          <th>Label</th>
                          <th>Node Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {#each expandedGraphInputs as [key, originalValue]}
                          <NodeConnection
                            {id}
                            {key}
                            title={formatTitle(getNode(originalValue[0]))}
                            connectionId={originalValue[0]}
                            tableView
                          />
                        {/each}
                      </tbody>
                    </table>
                  </div>
                {/if}
                {#if expandedGraphOutputs.length}
                  <div class="ml-auto">
                    <h3 class="font-bold mb-2">Graph Outputs</h3>
                    <table class="table table-xs w-auto ml-auto">
                      <thead>
                        <tr>
                          <th>Label</th>
                          <th class="tooltip tooltip-left" data-tip={TO_TOOLTIP_TEXT}>ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {#each graphOutputs as [targetId, targetInputLabel]}
                        <NodeConnection
                          {id}
                          key={targetInputLabel}
                          connectionId={targetId}
                          graphOutput
                          tableView
                        />
                        {/each}
                      </tbody>
                    </table>
                  </div>
                {/if}
              </div>
            {/if}
            {#if inputs.length}
              <h3 class="font-bold mb-2">Inputs</h3>
              <ul class="flex flex-wrap">
                {#each inputs as [key, originalValue]}
                  <NodeInput {id} {key} {originalValue}/>
                {/each}
              </ul>
            {/if}
            {#if outputs}
              <h3 class="font-bold">Outputs</h3>
              <ul>
                {#each Object.entries(outputs) as [key, originalValue]}
                  <NodeOutput {id} {key} {originalValue} />
                {/each}
              </ul>
            {/if}
          </div>
          {#if graphOutputs.length}
            <div>
              <ul class="flex flex-col gap-2 items-center">
                {#each graphOutputs as [targetId, targetInputLabel]}
                <NodeConnection
                  {id}
                  key={targetInputLabel}
                  connectionId={targetId}
                  graphOutput
                />
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/if}
    </section>
  </div>
  {@render trailingHr()}
</li>

<style lang="postcss">
  h2 {
    /* need confirm dis works on mobile */
    scroll-margin-top: 4.5rem;
  }

  .tooltip:before {
    @apply font-normal z-20;
  }
</style>
