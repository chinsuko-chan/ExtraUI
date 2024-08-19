<script>
  let { workflowName, id, key, value } = $props()

  import NodeInputEditor from "./NodeInputEditor.svelte"

  let isModified = $state(false)
  let isExpanded = $state(false)

  function toggle() {
    isExpanded = !isExpanded
  }
</script>

<li
  class:w-full={isExpanded}
  class:mb-4={isExpanded}
  class:border={isExpanded}
  class:border-secondary={isExpanded && isModified}
  class:shadow-md={isExpanded}
  class:rounded-md={isExpanded}
>
  <div class="collapse min-h-4 relative pt-0" class:collapse-arrow={isExpanded}>
    <input
      class={isExpanded ? null : "absolute inset"}
      type="checkbox"
      checked={isExpanded}
      onchange={toggle}
    />
    <div
      class="collapse-title flex items-center min-h-4 hover:bg-primary"
      class:p-2={!isExpanded}
      class:mb-4={isExpanded}
    >
      <code
        class={isModified ? null : "dark:border-neutral-content"}
        class:btn={!isExpanded}
        class:btn-xs={!isExpanded}
        class:btn-outline={isModified}
        class:btn-secondary={isModified}>{key}</code
      >
    </div>
    {#if isExpanded}
      <div class="collapse-content">
        <NodeInputEditor {workflowName} {id} {key} {value} />
      </div>
    {/if}
  </div>
</li>
