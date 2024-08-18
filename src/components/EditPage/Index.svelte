<script>
  import Node from "./Node.svelte"

  const mock = {
    id: "id",
    class_type: "NodeNameNya",
    _meta: { title: "NodeNameNya" },
    graphInputs: [
      { key: "Model", value: ["id", -999] },
      { key: "CLIP", value: ["id", -999] },
      { key: "VAE", value: ["id", -999] },
    ],
    inputs: [1, 2, 3, 4, "uwu", "nya"].map((val) => ({
      key: `key-${val}`,
      value: val,
    })),
    graphOutputs: [
      // todo; this needs to be derived by hand
    ],
    outputs: [],
  }

  const nodes = [
    "10",
    "15",
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
    "69",
    "420",
  ].map((id) => ({
    ...mock,
    id,
  }))
</script>

<article class="max-w-screen-sm mx-4 mr-6 md:mx-auto">
  <ul>
    {#each nodes as node, index}
      <Node
        id={node.id}
        {node}
        {index}
        finalIndex={nodes.length - 1}
        expanded={Math.random() > 0.25}
        graphInputs={node.graphInputs}
        inputs={node.inputs}
        graphOutputs={node.graphOutputs}
        outputs={node.outputs}
      />
    {/each}
  </ul>
</article>
