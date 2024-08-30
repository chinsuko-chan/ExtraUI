<script>
  let { workflowName, id, key, keyIndex } = $props()

  import { connectNode, connectInput } from "stores/workflows.svelte"
  let node = $derived(connectNode(workflowName, id).current)
  let inputStore = $derived(connectInput(workflowName, id, key))

  import unpinSvg from "assets/unpin.svg?raw"

  const htmlFor = `pinned-input-${workflowName}-${id}-${key}`
</script>

<div class="contents relative">
  {#if keyIndex === 0}
    <a href={`#node-${id}`} class="btn btn-xs btn-circle bg-base-100">
      {id}
    </a>
  {:else}
    <span></span>
  {/if}

  <label class="py-1 px-2" for={htmlFor}>
    {#if keyIndex === 0}
      <h4 class="text-xs font-bold">
        {node._meta?.title || node.class_type}
      </h4>
    {/if}
    <h5 class="text-xs font-mono" class:text-secondary={inputStore.isChanged}>
      {key}
    </h5>
  </label>
  <div class="form-control flex-row">
    {#if typeof inputStore.value === "number"}
      <input
        id={htmlFor}
        type="number"
        bind:value={inputStore.value}
        class="input input-xs input-bordered w-full"
        class:border-secondary={inputStore.isChanged}
      />
    {:else if typeof inputStore.value === "string"}
      <textarea
        id={htmlFor}
        class="textarea textarea-xs textarea-bordered w-full"
        bind:value={inputStore.value}
        class:border-secondary={inputStore.isChanged}
      ></textarea>
    {:else}
      <div class="rounded-md break-all">
        <code class="text-xs">
          {JSON.stringify(inputStore.value)}
        </code>
      </div>
    {/if}
  </div>

  <button
    class="z-10 btn btn-xs btn-ghost hover:text-error"
    onclick={() => inputStore.unpin()}
  >
    {@html unpinSvg}
  </button>
</div>
