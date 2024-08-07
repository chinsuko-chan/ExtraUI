<script>
    import { onMount } from 'svelte'

  // (observation) workflow inputs are usually:
  // - json value (eg. string, int)
  // - array
  // - object of unknown shape (nesting optional)
  //
  // this component accepts 3 inputs:
  // - original object
  // - workflow node id
  // - workflow node's input key name
  //
  // and creates an appropriate editable element based on the content

  let { id, key, originalValue } = $props()

  import { connectWorkflowManager } from "stores/workflowManager.svelte"
  const manager = connectWorkflowManager(id, key)

  let edited = $derived.by(() => {
    if (!manager.inputValue || manager.inputValue === "") return false

    return manager.inputValue !== originalValue
  })

  let editable = $derived.by(() => {
    if (typeof originalValue === "number") return true
    if (typeof originalValue === "string") return true
    return false
  })

  onMount(() => {
    /**
     * This is so f'n hard to explain... but here goes:
     * @gotcha #1 edits are a separate state, so value can be blank, BUT
     * @gotcha #2 bcuz edits two-way bound, CANNOT assign the value in an effect
     *            (else we get infinite loop), so we must put it on mount, BUT!
     * @gotcha #3 the edit state persists even after collapsing this component.
     *            SO, we must check if value was already persisted before, else
     *            every time the component is collapsed the edit is lost.
     */
    if (editable && !manager.inputValue) {
      manager.inputValue = originalValue
    }
  })
</script>

{#snippet numberInput(val)}
  <label class="form-control flex-row items-start gap-2">
    <span
      class="badge badge-info"
      class:badge-outline={!edited}
    >
      Number
    </span>
    <input
      type="number"
      class="input input-bordered input-sm max-w-xs"
      bind:value={manager.inputValue}
      placeholder={val}
    />
  </label>
{/snippet}

{#snippet textInput(val)}
  <label class="form-control flex-row items-start gap-2">
    <span
      class="badge badge-success"
      class:badge-outline={!edited}
    >
      String
    </span>
    <textarea
      class="textarea textarea-bordered w-full"
      bind:value={manager.inputValue}
      placeholder={val}
    ></textarea>
  </label>
{/snippet}

{#if typeof originalValue === "number"}
  {@render numberInput(originalValue)}
{:else if typeof originalValue === "string"}
  {@render textInput(originalValue)}
{:else}
  <span>{JSON.stringify(originalValue)}</span>
{/if}
