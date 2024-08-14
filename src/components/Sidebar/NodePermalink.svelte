<script>
  let expandedId = (() => {
    if (!location.hash) return ""

    return location.hash.replace(/^#node-/, "")
  })()

  function shouldDisplayBadge(value) {
    if (typeof value === "number") return true
    if (typeof value === "string") return true
    if (Array.isArray(value)) return true
    return false
  }

  function displayText(value) {
    if (typeof value === "number") return "Number"
    if (typeof value === "string") return "String"
    if (Array.isArray(value)) return "Node"
    throw new Error(`value not supported: ${value}`)
  }
</script>

<li class="flex-grow-0 max-w-full">
  <a href="#" class="absolute top-0 -left-4 flex opacity-50 hover:opacity-100">
    <span class="text-base font-bold">#</span>
  </a>

  <details class="max-w-full" open={expandedId === 0}>
    <summary class="ml-8">
      1. Crazy Ahh Title
    </summary>

    <ul>
      <li>{@render inputsList()}</li>

      {#if Math.random() > 0.5}
        <li>{@render outputsList()}</li>
      {/if}
    </ul>
  </details>
</li>

{#snippet inputsList()}
<details class="max-w-full" open={expandedId === 0}>
    <summary>
      <span>{"Inputs "}</span>
      <span class="badge">99</span>
    </summary>

    <ul>
      {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num}
        <li>
          <div>
            <code class="text-xs break-all">{num}</code>
            <span
              class="badge badge-sm badge-outline"
              class:badge-info={typeof num === "number"}
              class:badge-success={typeof num === "string"}
            >
              {displayText(num)}
            </span>
          </div>
        </li>
      {/each}
    </ul>
  </details>
{/snippet}

{#snippet outputsList()}
<details class="max-w-full" open={expandedId === 0}>
    <summary class="text-primary">
      {"Outputs "}
      <span class="badge">2</span>
    </summary>

    <ul>
      {#each [1, 2] as num}
        <li>
          <code class="text-primary text-xs break-all">{`xd ! ${num}`}</code>
        </li>
      {/each}
    </ul>
  </details>
{/snippet}
