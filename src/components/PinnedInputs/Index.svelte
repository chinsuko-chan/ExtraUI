<script>
  let { workflowPins } = $props()

  import PinnedInput from "./PinnedInput.svelte"
</script>

<aside class="w-full relative max-w-32">
  {#each workflowPins as { name, nodes }}
    <ul class="absolute inset-0">
      {#each nodes as { id, keys }}
        {#each keys as { key }}
          <PinnedInput workflowName={name} {id} {key} />
        {/each}
      {/each}
    </ul>
  {/each}
</aside>
