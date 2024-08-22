<script>
  let { selectedWorkflowName, selectWorkflow, name, nodes, index } = $props()

  import NodePermalink from "./NodePermalink.svelte"
</script>

<li>
  <button
    class:active={selectedWorkflowName === name}
    onclick={() => selectWorkflow(index)}
  >
    <h2>{name}</h2>
  </button>
</li>

{#each nodes as node}
  <NodePermalink workflowName={name} id={node.id} {node} />
{/each}

<style lang="postcss">
  button {
    @apply menu-title;
  }
</style>
