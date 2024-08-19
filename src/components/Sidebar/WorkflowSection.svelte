<script>
  let { name, nodes } = $props()

  import NodePermalink from "./NodePermalink.svelte"
</script>

<li>
  <h2 class="menu-title">{name}</h2>
</li>

{#each nodes as node}
  <NodePermalink workflowName={name} id={node.id} {node} />
{/each}
