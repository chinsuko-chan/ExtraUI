<script>
  let { workflowName, id, key, value } = $props()

  const KEY = "extraUI.components.editPage.nodeInput.expandedState"
  import connect from "lib/localStore"
  const localViewState = connect(KEY, {})
  let viewState = $state(localViewState.current)

  import { connectInput } from "stores/workflows.svelte"
  const inputStore = connectInput(workflowName, id, key)

  import NodeInputEditor from "./NodeInputEditor.svelte"

  let isExpanded = $derived(!!viewState[workflowName]?.[id]?.[key])

  function toggle() {
    const newState = JSON.parse(JSON.stringify(localViewState.current))

    if (newState[workflowName]?.[id]?.[key]) {
      delete newState[workflowName][id][key]
      delete viewState[workflowName][id][key]
    } else {
      newState[workflowName] ||= {}
      newState[workflowName][id] ||= {}
      viewState[workflowName] ||= {}
      viewState[workflowName][id] ||= {}

      newState[workflowName][id][key] = 1
      viewState[workflowName][id][key] = 1
    }

    localViewState.save(newState)
  }
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
      onchange={toggle}
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
        <NodeInputEditor {workflowName} {id} {key} {value} />
      </div>
    {/if}
  </div>
</li>
