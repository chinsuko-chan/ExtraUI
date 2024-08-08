<script>
  let { id, key, connectionId, title = null, tableView = false, graphOutput = false } = $props()

  import { connectViewState } from "./viewState.svelte"
  const view = graphOutput ? connectViewState(id, null, connectionId) : connectViewState(id, key)

  function handleToggle() {
    if (graphOutput) {
      view.toggleOutput()
    } else {
      view.toggleInput()
    }
    view.save()
  }
</script>

{#snippet normalView()}
  <li class="relative">
    <label
      title={key}
      data-tip={key}
      class="cursor-pointer tooltip"
      class:tooltip-left={graphOutput}
      class:tooltip-right={!graphOutput}
      class:text-info={view.isExpanded}
    >
      <span
        class="btn btn-circle btn-xs btn-ghost hover:opacity-100"
        class:opacity-50={!view.isExpanded}
        class:btn-outline={view.isExpanded}
      >{connectionId}</span
      >
      <input
        type="checkbox"
        class="absolute inset appearance-none opacity-0"
        checked={view.isExpanded}
        onchange={handleToggle}
      />
    </label>
  </li>
{/snippet}


{#if tableView}
  {#if graphOutput}
    <tr>
      <td><code class="text-xs">{key}</code></td>
      <th>{connectionId}</th>
    </tr>
  {:else}
    <tr>
      <th>{connectionId}</th>
      <td><code class="text-xs">{key}</code></td>
      <td>{title}</td>
    </tr>
  {/if}
{:else}
  {@render normalView()}
{/if}
