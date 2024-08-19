<script>
  import { connectInput } from "stores/workflows.svelte"
  let { workflowName, id, key, value } = $props()

  const inputStore = connectInput(workflowName, id, key)
</script>

{#if typeof value === "number"}
  <label class="form-control flex-row items-start gap-2">
    <span class="badge badge-info" class:badge-outline={!inputStore.hasChanges}>
      Number
    </span>
    <input
      type="number"
      class="input input-bordered input-sm max-w-xs"
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
