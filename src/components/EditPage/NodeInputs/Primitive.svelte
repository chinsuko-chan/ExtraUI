<script>
  // primitive is the fallback for everything that doesn't need custom
  let { workflowName, id, key, value, expandedState, toggleInput } = $props()

  import pinSvg from "assets/pin.svg?raw"
  import unpinSvg from "assets/unpin.svg?raw"

  import { connectInput } from "stores/workflows.svelte"
  let inputStore = $derived(connectInput(workflowName, id, key))

  let isExpanded = $derived(!!expandedState[key])

  function togglePin() {
    if (inputStore.isPinned) {
      inputStore.unpin()
    } else {
      inputStore.pin()
    }
  }
</script>

{#snippet badge(text, badgeClass)}
  <span
    class={`badge ${badgeClass}`}
    class:badge-outline={!inputStore.isChanged}
  >
    {text}
  </span>
{/snippet}

<li
  class="bg-base-100"
  class:w-full={isExpanded}
  class:mb-4={isExpanded}
  class:border={isExpanded}
  class:shadow-md={isExpanded}
  class:rounded-md={isExpanded}
  class:border-secondary={inputStore.isChanged}
  class:border-warning={inputStore.isPinned}
>
  <div class="collapse min-h-4 relative pt-0" class:collapse-arrow={isExpanded}>
    <input
      class={isExpanded ? null : "absolute inset"}
      type="checkbox"
      checked={isExpanded}
      onchange={() => toggleInput(key)}
    />
    <div
      class="collapse-title flex items-center min-h-4"
      class:p-2={!isExpanded}
      class:mb-4={isExpanded}
    >
      <code
        class:btn={!isExpanded}
        class:btn-xs={!isExpanded}
        class:btn-outline={inputStore.isChanged}
        class:border-warning={inputStore.isPinned}
        class:btn-secondary={inputStore.isChanged}>{key}</code
      >

      {#if isExpanded}
        <button
          class="btn btn-xs btn-ghost z-10 ml-auto"
          class:text-warning={inputStore.isPinned}
          onclick={togglePin}
        >
          {#if inputStore.isPinned}
            {@html unpinSvg}
          {:else}
            {@html pinSvg}
          {/if}
        </button>
      {/if}
    </div>
    {#if isExpanded}
      <div class="collapse-content px-3 pb-3">
        {#if typeof value === "number"}
          <label class="form-control flex-row items-start gap-2">
            {@render badge("Number", "badge-info")}
            <input
              type="number"
              class="input input-bordered input-sm max-w-36 sm:max-w-full"
              bind:value={inputStore.value}
              placeholder={value}
            />
          </label>
        {:else if typeof value === "string"}
          <label class="form-control flex-row items-start gap-2">
            {@render badge("String", "badge-success")}
            <textarea
              class="textarea textarea-bordered w-full"
              bind:value={inputStore.value}
              placeholder={value}
            ></textarea>
          </label>
        {:else}
          <div class="bg-base-200 w-full px-4 py-2 rounded-md break-all">
            <code class="text-xs">
              {JSON.stringify(value)}
            </code>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</li>
