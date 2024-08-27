<script>
  let { workflowName, nodeTitle, graphInputs, graphOutputs } = $props()

  import { getNode } from "stores/workflows.svelte"

  let fromTip = $derived(
    `These are the IDs of nodes with incoming connections to ${nodeTitle}.`,
  )
  let toTip = $derived(`${nodeTitle} outputs to these nodes.`)

  function formatTitle(nodeId) {
    const node = getNode(workflowName, nodeId)
    return node._meta?.title || node.class_type || "???"
  }
</script>

<div class="flex justify-between mb-4">
  {#if graphInputs.length}
    <section>
      <h3 class="font-bold mb-2">Graph Inputs</h3>
      <table class="table table-xs w-auto">
        <thead>
          <tr>
            <th class="tooltip tooltip-right" data-tip={fromTip}>ID</th>
            <th>Label</th>
            <th>Node Name</th>
          </tr>
        </thead>
        <tbody>
          {#each graphInputs as { key, value }}
            <tr>
              <th>{value[0]}</th>
              <td><code class="text-xs">{key}</code></td>
              <td>{formatTitle(value[0])}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}
  {#if graphOutputs.length}
    <section class="ml-auto">
      <h3 class="font-bold mb-2">Graph Outputs</h3>
      <table class="table table-xs w-auto ml-auto">
        <thead>
          <tr>
            <th>Node Name</th>
            <th>Label</th>
            <th class="tooltip tooltip-left" data-tip={toTip}>ID</th>
          </tr>
        </thead>
        <tbody>
          {#each graphOutputs as { key, value }}
            <tr>
              <td>{formatTitle(value[0])}</td>
              <td><code class="text-xs">{key}</code></td>
              <th>{value[0]}</th>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}
</div>

<style lang="postcss">
  .tooltip:before {
    @apply font-normal z-20;
  }
</style>
