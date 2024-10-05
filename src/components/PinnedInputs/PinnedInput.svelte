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
    <a href={`#node-${id}`} class="btn btn-xs btn-circle bg-base-100 mx-auto">
      {id}
    </a>

    <h4 class="text-xs font-bold my-auto">
      {node._meta?.title || node.class_type}
    </h4>
  {/if}
</div>

<div class="contents relative">
  <div>
    <button
      class="z-10 btn btn-xs btn-ghost hover:text-error"
      onclick={() => inputStore.unpin()}
    >
      {@html unpinSvg}
    </button>
  </div>

  <div class="grid grid-cols-5">
    <label class="py-1 col-span-2" for={htmlFor}>
      <h5
        class="text-xs font-mono mb-auto"
        class:text-secondary={inputStore.isChanged}
      >
        {key}
      </h5>
    </label>

    <div class="col-span-3">
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
  </div>
</div>
