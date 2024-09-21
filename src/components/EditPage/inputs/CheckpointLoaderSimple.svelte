<script>
  let { workflowName, id, inputs } = $props()

  // used for list of valid models
  const KEY = "extraUI.objectInfo.CheckpointLoaderSimple"
  import connect from "lib/localStore"
  const localViewState = connect(KEY, {})
  let viewState = $state(localViewState.current)

  let validOptions = $derived.by(() => {
    return (
      viewState?.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] || []
    )
  })

  import { connectInput } from "stores/workflows.svelte"
  let inputStore = $derived(connectInput(workflowName, id, inputs[0].key))

  import { api } from "stores/api.svelte"

  // ask server for info
  $effect(async () => {
    if (viewState.CheckpointLoaderSimple) return
    viewState = await api.objectInfo("CheckpointLoaderSimple")
    localViewState.save(viewState)
  })
</script>

<div>
  <select
    bind:value={inputStore.value}
    class="select select-sm select-bordered w-full"
    class:border-secondary={inputStore.isChanged}
  >
    {#if validOptions.length}
      <option disabled>Select SD model</option>
      {#each validOptions as sdModel}
        <option>{sdModel}</option>
      {/each}
    {:else}
      <option disabled selected>No SD models available</option>
    {/if}
  </select>
</div>
