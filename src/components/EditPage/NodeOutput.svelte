<script>
  import { untrack } from "svelte"

  /** support rendering images, or a stringified JSON */
  let { workflowName, id, key, value } = $props()

  import { connectWorkflow } from "stores/workflows.svelte"
  const workflow = $derived(connectWorkflow(workflowName))
  import fetchImage from "stores/imageCache.svelte"

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
</script>

<li>
  <div class="flex flex-col gap-2 p-2">
    <code class="badge badge-outline badge-primary">{key}</code>
    <div>
      {#if images.length}
        {#each images as attributes}
          <img src={attributes.blob} alt={attributes.filename} />
        {/each}
      {:else}
        <!-- ambiguous element... curious... -->
        <div class="bg-base-200 w-full px-4 py-2 rounded-md break-all">
          <code class="text-sm">{value}</code>
        </div>
      {/if}
    </div>
  </div>
</li>
