<script>
  import { outputs } from "stores/outputsManager.svelte"

  /** behold.... in all it's glory */
  let flattenedRows = $derived.by(() => {
    const out = []
    outputs.history.forEach(([promptId, nodesWithOutputs], runIndex) => {
      Object.entries(nodesWithOutputs).forEach(
        ([nodeId, nodeOutputs], nodeIndex) => {
          Object.entries(nodeOutputs).forEach(
            ([outputKey, arrayOfImages], outputIndex) => {
              arrayOfImages.forEach((attributes, imageIndex) => {
                out.push({
                  promptId,
                  nodeId,
                  outputKey,
                  attributes,
                  // indicies, by nestedness
                  runIndex,
                  nodeIndex,
                  outputIndex,
                  imageIndex,
                })
              })
            },
          )
        },
      )
    })
    return out
  })

  function headerMessage(runIndex) {
    if (!runIndex) return "Previous run"
    if (runIndex === 1) return "1 run ago"
    return `${runIndex} runs ago`
  }
</script>

{#if outputs.history}
  <table class="table table-xs table-pin-rows">
    {#each flattenedRows as { promptId, runIndex, nodeIndex, nodeId, outputKey, outputIndex, attributes, imageIndex }}
      {#if imageIndex === 0 && nodeIndex === 0}
        <thead>
          <tr>
            <th>{headerMessage(runIndex)}</th>
          </tr>
        </thead>
      {/if}
      <tbody>
        <tr>
          <th class:opacity-0={imageIndex !== 0}>Node ID: {nodeId}</th>
          <td class:opacity-0={outputIndex !== 0}><code>{outputKey}</code></td>
          <td>{attributes.filename}</td>
        </tr>
      </tbody>
    {/each}
  </table>
{:else}
  <div>
    <h2>No outputs yet!</h2>
  </div>
{/if}
