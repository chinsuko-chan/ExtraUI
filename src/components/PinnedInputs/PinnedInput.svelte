<script>
  let { workflowName, id, key } = $props()

  import { connectInput } from "stores/workflows.svelte"
  let inputStore = $derived(connectInput(workflowName, id, key))

  // note: binding offsetHeight not saved after refresh; its broked
</script>

<li
  class="sticky sticky-offset-top"
  style={`--offsetTop: ${inputStore.actualOffsetHeight}px;`}
>
  <label class="form-control w-full max-w-xs">
    <div class="label">
      <code class="label-text" class:text-secondary={inputStore.isChanged}
        >{key}</code
      >
    </div>
    {#if typeof inputStore.value === "number"}
      <input
        type="number"
        bind:value={inputStore.value}
        class="input input-bordered input-sm w-full"
        class:border-secondary={inputStore.isChanged}
      />
    {:else if typeof inputStore.value === "string"}
      <textarea
        class="textarea textarea-bordered w-full"
        bind:value={inputStore.value}
        class:border-secondary={inputStore.isChanged}
      ></textarea>
    {:else}
      <span>{JSON.stringify(inputStore.value)}</span>
    {/if}
  </label>
</li>

<style>
  .sticky-offset-top {
    top: calc(4.5rem + var(--offsetTop));
  }
</style>
