<script>
  let {
    id,
    node,
    index,
    finalIndex,
    expanded,
    inputs,
    graphInputs,
    outputs,
    graphOutputs,
  } = $props()

  function formatTitle(nodeObj) {
    return nodeObj._meta?.title || nodeObj.class_type
  }

  let title = $state(formatTitle(node))

  function toggleNode() {
    console.log('toggle')
  }

  let inputsAndOutputsExpanded = $state(Math.random() > 0.5)
</script>

{#snippet expansionButton()}
  <div class="self-stretch">
    <div class="h-full flex flex-col">
      <button
        class="btn btn-xs btn-circle my-1"
        class:btn-outline={expanded}
        class:btn-primary={outputs.length}
        onclick={toggleNode}>
        {id}
      </button>
      {#if index !== finalIndex}
        <hr class="w-1 min-h-2 flex-grow mx-auto border-base-300 bg-base-300 rounded-lg" />
      {/if}
    </div>
  </div>
{/snippet}

{#snippet graphInputOutputAnchor({ key, value }, isOutput = false)}
  <li>
    <a
      href={`#node-${value[0]}`}
      title={key}
      data-tip={key}
      class="btn btn-circle btn-xs"
      class:tooltip-left={isOutput}
      class:tooltip-right={!isOutput}
    >
      <span>
        {value[0]}
      </span>
    </a>
  </li>
{/snippet}

{#snippet expandedInfo()}
  <div class="flex justify-between">
    <div>
      {#each inputs as _input}
        <span>input!</span>
      {/each}
    </div>
    <div>
      {#each outputs as _outputs}
        <span>output!</span>
      {/each}
    </div>
  </div>
{/snippet}

<li class="flex gap-8" class:mb-16={index === finalIndex}>
  {@render expansionButton()}

  <div
    class:mt-1={!expanded}
    class:mb-2={expanded}
    class:timeline-box={expanded}
    class:flex-grow={expanded}
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
                {#each graphInputs as input}
                  {@render graphInputOutputAnchor(input)}
                {/each}
              </ul>
            </div>
          {/if}
          <div class="flex-grow">
            {#if inputsAndOutputsExpanded}
              {@render expandedInfo()}
            {/if}
            {#if inputs.length}
              <h3 class="font-bold mb-2">Inputs</h3>
              <ul class="flex flex-wrap">
                {#each inputs as input}
                  <!-- <NodeInput id={input.id} key={input.key} originalValue={input.value} /> -->
                  <span>todo !</span>
                {/each}
              </ul>
            {/if}
            {#if outputs.length}
              <h3 class="font-bold">Outputs</h3>
              <ul>
                {#each outputs as output}
                  <span>todo !</span>
                {/each}
              </ul>
            {/if}
          </div>
          {#if graphOutputs.length}
            <div>
              <ul class="flex flex-col gap-2 items-center">
                {#each graphOutputs as output}
                  {@render graphInputOutputAnchor(output, true)}
                {/each}
            </ul>
          </div>
          {/if}
        </div>
      {/if}
    </section>
  </div>
</li>

<style lang="postcss">
  h2 {
    /* need confirm dis works on mobile */
    scroll-margin-top: 4.5rem;
  }
</style>
