<script>
  // let { id, key, value } = $props()
  let { value } = $props()

  let editValue = $state(value)

  let edited = $derived(editValue !== value)
</script>

{#if typeof value === "number"}
  <label class="form-control flex-row items-start gap-2">
    <span class="badge badge-info" class:badge-outline={!edited}> Number </span>
    <input
      type="number"
      class="input input-bordered input-sm max-w-xs"
      bind:value={editValue}
      placeholder={value}
    />
  </label>
{:else if typeof value === "string"}
  <label class="form-control flex-row items-start gap-2">
    <span class="badge badge-success" class:badge-outline={!edited}>
      String
    </span>
    <textarea
      class="textarea textarea-bordered w-full"
      bind:value={editValue}
      placeholder={value}
    ></textarea>
  </label>
{:else}
  <span>{JSON.stringify(value)}</span>
{/if}
