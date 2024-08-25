<script>
  import { untrack } from "svelte"

  /** support rendering images, or a stringified JSON */
  let { workflowName, id, key, value } = $props()

  const KEY = "extraUI.components.editPage.nodeOutput.imagesLayout"
  import connect from "lib/localStore"
  const localViewState = connect(KEY, {})
  let viewState = $state(localViewState.current)
  let imagesLayout = $derived(viewState[id]?.[key] || 1)

  import { connectWorkflow } from "stores/workflows.svelte"
  let workflow = $derived(connectWorkflow(workflowName))

  import fetchImage from "stores/imageCache.svelte"

  import svgCols1 from "assets/1x1.svg?raw"
  import svgCols2 from "assets/2x2.svg?raw"
  import svgCols3 from "assets/3x3.svg?raw"
  import svgCols4 from "assets/4x4.svg?raw"

  async function getImageAttributes(attributes) {
    return await fetchImage(
      workflowName,
      $state.snapshot(workflow.currentApi),
      {
        nodeId: id,
        inputKey: key,
        attributes,
      },
    )
  }

  let images = $state([])
  $effect(async () => {
    if (!Array.isArray(value)) return []
    if (!value.every((v) => v?.filename && v?.type)) return []

    images = await Promise.all(value.map(getImageAttributes))
    untrack(() => images)
  })

  function changeImagesLayout(newColCount) {
    viewState[id] ||= {}
    viewState[id][key] = newColCount
    localViewState.save(viewState)
  }
</script>

<li>
  <div class="flex flex-col gap-2 p-2">
    {#if images.length}
      <div class="flex justify-between">
        <code class="badge badge-outline badge-primary">{key}</code>
        <div>
          {#each [[1, svgCols1], [2, svgCols2], [3, svgCols3], [4, svgCols4]] as [col, svgAsset]}
            <button
              class="btn btn-sm"
              class:btn-ghost={col !== imagesLayout}
              class:btn-outline={col === imagesLayout}
              class:btn-primary={col === imagesLayout}
              onclick={() => changeImagesLayout(col)}>{@html svgAsset}</button
            >
          {/each}
        </div>
      </div>
      <div
        class="grid"
        class:grid-cols-2={imagesLayout === 2}
        class:grid-cols-3={imagesLayout === 3}
        class:grid-cols-4={imagesLayout === 4}
      >
        {#each images as attributes}
          <img src={attributes.blob} alt={attributes.filename} />
        {/each}
      </div>
    {:else}
      <!-- ambiguous element... curious... -->
      <code class="badge badge-outline badge-primary">{key}</code>
      <div class="bg-base-200 w-full px-4 py-2 rounded-md break-all">
        <code class="text-sm">{JSON.stringify(value)}</code>
      </div>
    {/if}
  </div>
</li>
