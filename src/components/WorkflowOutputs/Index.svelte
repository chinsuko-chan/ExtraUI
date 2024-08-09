<script>
  import { outputs, fetchImage } from "stores/outputsManager.svelte"

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

  let expanded = $state({})
  $effect(() => {
    Object.entries(expanded).forEach(async ([key, value]) => {
      if (!Array.isArray(value)) return true
      const [nodeId, outputKey, attributes] = value
      expanded[key] = await loadImage({ nodeId, outputKey, attributes })
    })
  })

  function handleExpand(runIndex, nodeId, outputKey, imageIndex, attributes) {
    const key = `${runIndex}:${nodeId}:${outputKey}:${imageIndex}`
    if (expanded[key]) return delete expanded[key]
    expanded[key] = [nodeId, outputKey, attributes]
  }

  async function loadImage({ nodeId, outputKey: inputKey, attributes }) {
    return await fetchImage({ nodeId, inputKey, attributes })
  }
</script>

{#if outputs.history}
  <table class="table table-xs table-pin-rows">
    {#each flattenedRows as { promptId, runIndex, nodeIndex, nodeId, outputKey, outputIndex, attributes, imageIndex }}
      {#if imageIndex === 0 && nodeIndex === 0}
        <thead>
          <tr class="h-8 bg-base-200">
            <th class="border-b-2">{headerMessage(runIndex)}</th>
            <th class="border-b-2"></th>
            <th class="border-b-2"></th>
          </tr>
        </thead>
      {/if}
      <tbody>
        <tr
          class="hover cursor-pointer"
          onclick={() =>
            handleExpand(runIndex, nodeId, outputKey, imageIndex, attributes)}
        >
          <th class:opacity-0={imageIndex !== 0}>Node ID: {nodeId}</th>
          <td class:opacity-0={outputIndex !== 0}><code>{outputKey}</code></td>
          <td class="w-full">
            {#if expanded[`${runIndex}:${nodeId}:${outputKey}:${imageIndex}`]}
              <img
                class="max-h-96"
                src={expanded[
                  `${runIndex}:${nodeId}:${outputKey}:${imageIndex}`
                ]?.blob}
                alt={attributes.filename}
              />
            {:else}
              <span>{attributes.filename}</span>
            {/if}
          </td>
        </tr>
      </tbody>
    {/each}
  </table>
{:else}
  <div>
    <h2>No outputs yet!</h2>
  </div>
{/if}
