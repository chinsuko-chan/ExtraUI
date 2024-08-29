<script>
  const KEY = "extraUI.components.editPage.node.expandedState"
  import connect from "lib/localStore"
  const localViewState = connect(KEY, {})
  let viewState = $state(localViewState.current)

  let {
    workflowName,
    id,
    node,
    index,
    finalIndex,
    inputs,
    graphInputs,
    outputs,
    graphOutputs,
  } = $props()

  let outputsByKey = $derived(Object.entries(outputs))

  let expanded = $derived(!!viewState[workflowName]?.[id])

  import NodeInputs from "./NodeInputs"
  import NodeOutput from "./NodeOutput.svelte"
  import NodeGraphInfo from "./NodeGraphInfo.svelte"

  function formatTitle(nodeObj) {
    return nodeObj._meta?.title || nodeObj.class_type
  }

  function toggleNode() {
    const newState = JSON.parse(JSON.stringify(localViewState.current))

    if (newState[workflowName]?.[id]) {
      delete newState[workflowName][id]
      delete viewState[workflowName][id]
    } else {
      newState[workflowName] ||= {}
      viewState[workflowName] ||= {}

      newState[workflowName][id] = {}
      viewState[workflowName][id] = {}
    }

    localViewState.save(newState)
  }

  function toggleInput(key) {
    const newState = JSON.parse(JSON.stringify(localViewState.current))

    if (newState[workflowName]?.[id]?.inputs?.[key]) {
      delete newState[workflowName][id].inputs[key]
      delete viewState[workflowName][id].inputs[key]
    } else {
      newState[workflowName] ||= { [id]: {} }
      viewState[workflowName] ||= { [id]: {} }

      newState[workflowName][id].inputs ||= {}
      viewState[workflowName][id].inputs ||= {}

      newState[workflowName][id].inputs[key] = 1
      viewState[workflowName][id].inputs[key] = 1
    }

    localViewState.save(newState)
  }

  function toggleOutput(key) {
    const newState = JSON.parse(JSON.stringify(localViewState.current))

    if (newState[workflowName]?.[id]?.outputs?.[key]) {
      delete newState[workflowName][id].outputs[key]
      delete viewState[workflowName][id].outputs[key]
    } else {
      newState[workflowName] ||= { [id]: {} }
      viewState[workflowName] ||= { [id]: {} }

      newState[workflowName][id].outputs ||= {}
      viewState[workflowName][id].outputs ||= {}

      newState[workflowName][id].outputs[key] = 1
      viewState[workflowName][id].outputs[key] = 1
    }

    localViewState.save(newState)
  }

  let title = $state(formatTitle(node))
  let graphInfoExpanded = $state(false)

  let allOutputsCollapsed = $derived.by(() => {
    return 0 === Object.entries(viewState[workflowName]?.[id]?.outputs || {}).reduce((count, [_key, val]) => {
      return count += Number(val)
    }, 0)
  })
</script>

{#snippet expansionButton()}
  <span class="self-stretch">
    <div class="h-full flex flex-col">
      <button
        class="btn btn-xs btn-circle my-1"
        class:btn-outline={expanded}
        class:btn-primary={outputsByKey.length}
        onclick={toggleNode}>
        {id}
      </button>
      {#if index !== finalIndex}
        <hr class="w-1 min-h-2 flex-grow mx-auto border-base-300 bg-base-300 rounded-lg" />
      {/if}
    </div>
  </span>
{/snippet}

{#snippet graphInputOutputAnchor({ key, value }, isOutput = false)}
  <li>
    <a
      href={`#node-${value[0]}`}
      title={key}
      data-tip={key}
      class="tooltip"
      class:tooltip-left={isOutput}
      class:tooltip-right={!isOutput}
    >
      <span class="btn btn-circle btn-xs">
        {value[0]}
      </span>
    </a>
  </li>
{/snippet}

{#snippet graphInputsColumn()}
  {#if graphInputs.length && !graphInfoExpanded}
    <aside class="pb-2">
      <ul class="flex flex-col gap-2 items-center">
        {#each graphInputs as input}
          {@render graphInputOutputAnchor(input)}
        {/each}
      </ul>
    </aside>
  {/if}
{/snippet}

{#snippet graphOutputsColumn()}
  {#if graphOutputs.length && !graphInfoExpanded}
    <aside class="pb-2">
      <ul class="flex flex-col gap-2 items-center">
        {#each graphOutputs as output}
          {@render graphInputOutputAnchor(output, true)}
        {/each}
      </ul>
    </aside>
  {/if}
{/snippet}

{#snippet inputsSection()}
  {#if inputs.length}
    <section>
      <NodeInputs
        {workflowName}
        nodeType={node.class_type}
        {inputs}
        {id}
        expandedState={viewState[workflowName]?.[id]?.inputs || {}}
        {toggleInput}
      />
    </section>
  {/if}
{/snippet}

{#snippet outputsSection()}
  {#if outputsByKey.length}
    <section>
      <h3 class="font-bold">Outputs</h3>
      <ul>
        {#each outputsByKey as [key, outputs]}
          <NodeOutput
            {workflowName}
            {id}
            {key}
            value={outputs}
            expanded={!!viewState[workflowName]?.[id]?.outputs?.[key]}
            {toggleOutput}
          />
        {/each}
      </ul>
    </section>
  {/if}
{/snippet}

<li
  class="flex gap-3"
  class:max-w-lg={allOutputsCollapsed && !graphInfoExpanded}
  class:mb-16={index === finalIndex}>
  {@render expansionButton()}

  <div
    class="py-1"
    class:mb-2={expanded}
    class:px-3={expanded}
    class:timeline-box={expanded}
  >
  <header class="flex justify-between items-center" class:mb-2={expanded}>
    <h2 id={`node-${id}`}>
      <a aria-hidden="true" tabindex="-1" href={`#node-${id}`}>
        <span
          class="mr-1 opacity-20 hover:opacity-60 text-base font-bold inline-block align-middle relative -mt-1"
          >#</span
        >
      </a>
      {title}
    </h2>

    {#if expanded}
      <button
        class="btn btn-sm btn-ghost font-light opacity-50 hover:opacity-100"
        onclick={() => graphInfoExpanded = !graphInfoExpanded}
      >
        {graphInfoExpanded ? "Collapse" : "Show Graph Info"}
      </button>
    {/if}
  </header>

  {#if expanded}
    <div class="flex flex-nowrap gap-3">
      {@render graphInputsColumn()}

      <div class="flex-grow">
        {#if graphInfoExpanded}
          <NodeGraphInfo
            {workflowName}
            nodeTitle={title}
            {graphInputs}
            {graphOutputs}
          />
        {/if}

        {@render inputsSection()}

        {@render outputsSection()}
      </div>

      {@render graphOutputsColumn()}
    </div>
  {/if}
  </div>
</li>

<style lang="postcss">
  h2 {
    /* need confirm dis works on mobile */
    scroll-margin-top: 4.5rem;
  }
</style>
