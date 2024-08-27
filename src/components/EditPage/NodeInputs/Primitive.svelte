<script>
  // primitive is the fallback for everything that doesn't need custom
  let { workflowName, id, key, value, expandedState, toggleInput } = $props()

  import { connectInput } from "stores/workflows.svelte"
  let inputStore = $derived(connectInput(workflowName, id, key))

  let isExpanded = $derived(!!expandedState[key])
</script>

<li
  class:w-full={isExpanded}
  class:mb-4={isExpanded}
  class:border={isExpanded}
  class:border-secondary={isExpanded && inputStore.isChanged}
  class:shadow-md={isExpanded}
  class:rounded-md={isExpanded}
>
  <div class="collapse min-h-4 relative pt-0" class:collapse-arrow={isExpanded}>
    <input
      class={isExpanded ? null : "absolute inset"}
      type="checkbox"
      checked={isExpanded}
      onchange={() => toggleInput(key)}
    />
    <div
      class="collapse-title flex items-center min-h-4 hover:bg-primary"
      class:p-2={!isExpanded}
      class:mb-4={isExpanded}
    >
      <code
        class={inputStore.isChanged ? null : "dark:border-neutral-content"}
        class:btn={!isExpanded}
        class:btn-xs={!isExpanded}
        class:btn-outline={inputStore.isChanged}
        class:btn-secondary={inputStore.isChanged}>{key}</code
      >
    </div>
    {#if isExpanded}
      <div class="collapse-content">
        {#if typeof value === "number"}
          <label class="form-control flex-row items-start gap-2">
            <span
              class="badge badge-info"
              class:badge-outline={!inputStore.hasChanges}
            >
              Number
            </span>
            <input
              type="number"
              class="input input-bordered input-sm max-w-36 sm:max-w-full"
              bind:value={inputStore.value}
              placeholder={value}
            />
          </label>
        {:else if typeof value === "string"}
          <label class="form-control flex-row items-start gap-2">
            <span
              class="badge badge-success"
              class:badge-outline={!inputStore.hasChanges}
            >
              String
            </span>
            <textarea
              class="textarea textarea-bordered w-full"
              bind:value={inputStore.value}
              placeholder={value}
            ></textarea>
          </label>
        {:else}
          <span>{JSON.stringify(value)}</span>
        {/if}
      </div>
    {/if}
  </div>
</li>
