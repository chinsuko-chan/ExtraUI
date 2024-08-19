<script>
  import workflowStore from "stores/workflows.svelte"

  let { drawerId = "workflowDrawer" } = $props()

  import ghLogoSvg from "assets/gh-logo.svg?raw"
  import twtSvg from "assets/twiddr.svg?raw"

  import WorkflowSection from "./WorkflowSection.svelte"
  import WorkflowImporter from "./WorkflowImporter.svelte"

  const statuses = ["Not connected", "Connecting", "Connected"]
  let statusIndex = $state(0)
  let apiStatus = $derived(statuses[statusIndex])
</script>

<input id={drawerId} type="checkbox" class="drawer-toggle" />
<div class="drawer-side border-base-200 border-x border-l-0 z-10">
  <label for={drawerId} class="drawer-overlay"></label>
  <aside class="flex flex-col bg-base-100 min-h-screen w-80">

    {@render header()}

    <div class="flex-grow m-4">
      <menu class="menu px-3 gap-1 border border-transparent">
        {#each workflowStore.workflows as { name, nodes }}
          <WorkflowSection {name} {nodes} />
        {/each}
        <li class="my-8">
          <WorkflowImporter />
        </li>
      </menu>
    </div>

    {@render footer()}
  </aside>
</div>

{#snippet header()}
  <header
    class="z-20 backdrop-blur-lg shadow-sm sticky top-0 p-4 gap-4"
  >
    <div class="flex justify-between items-center gap-2">
      <h1 class="font-mono font-bold text-xl md:text-2xl">GoodUI</h1>
      <button
        class="btn btn-xs btn-outline"
        class:btn-error={apiStatus === "Not connected"}
        class:btn-warning={apiStatus === "Connecting"}
        class:btn-success={apiStatus === "Connected"}
        onclick={() => statusIndex + 1 >= 3 ? statusIndex = 0 : statusIndex += 1}
      >
        {apiStatus}
      </button>
    </div>
  </header>
{/snippet}

{#snippet footer()}
  <footer class="footer text-xs grid-rows-2 gap-1 p-3 px-6">
    <a
      class="link btn btn-sm btn-ghost font-normal flex items-center gap-2"
      href="https://github.com/chinsuko-chan/GoodUI"
      target="_blank"
      rel="noopener"
    >
      <span>{@html ghLogoSvg}</span>
      GoodUI
    </a>
    <a
      class="link btn btn-sm btn-ghost font-normal flex items-center gap-2"
      href="https://x.com/chinsuko_chan"
      target="_blank"
      rel="noopener"
    >
      <span>{@html twtSvg}</span>
      @chinsuko_chan
    </a>
  </footer>
{/snippet}
