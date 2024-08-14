<script>
  import NodePermalink from "./NodePermalink.svelte"
</script>

<li>
  <h2 class="menu-title">sdxl example</h2>
</li>

{#each [1, 2, 3] as _node}
  <NodePermalink />
{/each}
