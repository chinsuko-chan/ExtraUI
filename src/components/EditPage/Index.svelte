<script>
  let { selectedWorkflowName } = $props()

  import Node from "./Node.svelte"

  import { connectWorkflow } from "stores/workflows.svelte"
  const workflowStore = connectWorkflow(selectedWorkflowName)

  let nodes = $derived(workflowStore.current?.nodes || [])
</script>

<article class="max-w-screen-sm mx-4 mr-6 md:mx-auto">
  <ul class="py-2">
    {#each nodes as node, index}
      <Node
        workflowName={selectedWorkflowName}
        id={node.id}
        {node}
        {index}
        finalIndex={nodes.length - 1}
        graphInputs={node.graphInputs}
        inputs={node.inputs}
        graphOutputs={node.graphOutputs}
        outputs={node.outputs}
      />
    {/each}
  </ul>
</article>
