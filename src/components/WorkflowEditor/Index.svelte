<script>
  let { nodeEntries } = $props()

  import { runner } from "stores/workflowRunnerManager.svelte"
  import { outputs } from "stores/outputsManager.svelte"

  import { isExpandedNode } from "./viewState.svelte"

  import Node from "./Node.svelte"

  // hacky solution to auto-fetch latest images... it works tho
  let previousImages = ""

  /** poll when most recent run changes */
  $effect(() => {
    if (runner?.lastRun?.prompt_id)
      return outputs.poll(runner.lastRun.prompt_id)
  })

  /** fetch images when output state changes */
  $effect(() => {
    if (!outputs.mostRecentFilenames.length) return

    if (previousImages !== JSON.stringify(outputs.mostRecentFilenames)) {
      outputs.pollImages(outputs.mostRecent)
      previousImages = JSON.stringify(outputs.mostRecentFilenames)
    }
  })
</script>

<article>
  <ul>
    {#each nodeEntries as [id, node], index}
      <Node
        {id}
        {node}
        {index}
        finalIndex={nodeEntries.length - 1}
        expanded={isExpandedNode(id)}
        outputs={outputs.mostRecent[id]}
      />
    {/each}
  </ul>
</article>
