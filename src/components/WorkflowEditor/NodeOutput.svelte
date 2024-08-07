<script>
  /** support rendering images, or a stringified JSON */
  let { id, key, originalValue } = $props()

  import { outputs } from "stores/outputsManager.svelte"

  let images = $derived.by(() => {
    if (!outputs.mostRecentImages[id]) return []
    if (!outputs.mostRecentImages[id][key]) return []
    return outputs.mostRecentImages[id][key]
  })
</script>

<li>
  <div class="flex flex-col gap-2 p-2">
    <code class="badge badge-outline badge-primary">{key}</code>
    <div>
      {#if images.length}
        {#each images as [fname, src]}
          <img {src} alt={fname} />
        {/each}
      {:else}
        <!-- ambiguous element... curious... -->
        <div class="bg-base-200 w-full px-4 py-2 rounded-md break-all">
          <code class="text-sm">{originalValue}</code>
        </div>
      {/if}
    </div>
  </div>
</li>
