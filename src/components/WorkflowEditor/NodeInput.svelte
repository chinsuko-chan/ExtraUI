<script>
  let { id, key, originalValue = null } = $props()

  import NodeInputEditor from "./NodeInputEditor.svelte"

  import { connectViewState } from "./viewState.svelte"
  import { connectWorkflowManager } from "stores/workflowManager.svelte"

  const manager = connectWorkflowManager(id, key)
  const view = connectViewState(id, key)

  let isModified = $derived(manager.isModifiedInput(id, key))

  function toggleInput() {
    view.toggleInput()
    view.save()
  }
</script>

<li
  class:w-full={view.isExpandedInput}
  class:mb-4={view.isExpandedInput}
  class:border={view.isExpandedInput}
  class:border-secondary={view.isExpandedInput && isModified}
  class:shadow-md={view.isExpandedInput}
  class:rounded-md={view.isExpandedInput}
>
  <div
    class="collapse min-h-4 relative"
    class:collapse-arrow={view.isExpandedInput}
  >
    <input
      class={view.isExpandedInput ? null : "absolute inset"}
      type="checkbox"
      checked={view.isExpandedInput}
      onchange={toggleInput}
    />
    <div
      class="collapse-title flex items-center min-h-4 hover:bg-primary"
      class:p-2={!view.isExpandedInput}
      class:mb-4={view.isExpandedInput}
    >
      <code
        class={isModified ? null : "dark:border-neutral-content"}
        class:btn={!view.isExpandedInput}
        class:btn-xs={!view.isExpandedInput}
        class:btn-outline={isModified}
        class:btn-secondary={isModified}>{key}</code
      >
    </div>
    {#if view.isExpandedInput}
      <div class="collapse-content">
        <NodeInputEditor {id} {key} {originalValue} />
      </div>
    {/if}
  </div>
</li>
