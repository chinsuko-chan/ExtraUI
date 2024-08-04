<script>
  /** sidebar is visible at all times >lg */
  const DRAWER_ID = "drawer"
  import menuSvg from "./assets/amburg.svg?raw"
  import ghLogoSvg from "./assets/gh-logo.svg?raw"
  import twtSvg from "./assets/twiddr.svg?raw"

  import WorkflowSelector from "./components/WorkflowSelector.svelte"
  import WorkflowUploadButton from "./components/WorkflowUploadButton.svelte"
  import WorkflowContents from "./components/WorkflowContents.svelte"
  import WorkflowRunButton from "./components/WorkflowRunButton.svelte"
  import ApiConfigModal from "./components/ApiConfigModal.svelte"

  import { api, STATUS } from "./stores/apiConnectionManager.svelte"

  let connected = $derived.by(() => {
    return api.status === STATUS.IDLE || api.status === STATUS.RUNNING
  })
  let apiConfigModal = $state()
</script>

{#snippet sidebar()}
  <header class="sticky top-0 px-4 py-2 grid grid-rows-2 gap-4">
    <div class="flex justify-between items-center gap-2">
      <h1 class="font-mono font-bold text-xl md:text-2xl">goodUI</h1>
      <button
        class="btn btn-xs btn-outline"
        class:btn-error={!connected}
        class:btn-success={connected}
        onclick={() => apiConfigModal.showModal()}
      >
        {connected ? "Connected" : "Not connected"}
      </button>
    </div>
    <div>
      <WorkflowUploadButton />
    </div>
  </header>
  <div class="flex-grow">
    <div>
      <menu class="menu px-4 py-0">
        <!-- only top-level is open at start -->
        <li>
          <details open>
            <summary>FOO</summary>

            <ul>
              <li>
                <details>
                  <summary>todo: add permalinks to each node</summary>

                  <ul>
                    <li>
                      <details>
                        <summary>Inputs: (4)</summary>

                        <ul>
                          <li><a href="#">CLIP</a></li>
                          <li><a href="#">VAE</a></li>
                          <li><a href="#">Model</a></li>
                        </ul>
                      </details>
                    </li>
                    <li>
                      <details>
                        <summary>Outputs: (4)</summary>

                        <ul>
                          <li><a href="#">Image</a></li>
                          <li><a href="#">Image</a></li>
                          <li><a href="#">Image</a></li>
                        </ul>
                      </details>
                    </li>
                  </ul>
                </details>
              </li>
              <li>
                <details>
                  <summary>todo: add permalinks to each node</summary>

                  <ul>
                    <li>
                      <details>
                        <summary>Inputs: (4)</summary>

                        <ul>
                          <li><a href="#">CLIP</a></li>
                          <li><a href="#">VAE</a></li>
                          <li><a href="#">Model</a></li>
                        </ul>
                      </details>
                    </li>
                    <li>
                      <details>
                        <summary>Outputs: (4)</summary>

                        <ul>
                          <li><a href="#">Image</a></li>
                          <li><a href="#">Image</a></li>
                          <li><a href="#">Image</a></li>
                        </ul>
                      </details>
                    </li>
                  </ul>
                </details>
              </li>
            </ul>
          </details>
        </li>
        <li>
          <details open>
            <summary>BAR</summary>

            <ul>
              <li>
                <details>
                  <summary>todo: add permalinks to each node</summary>

                  <ul>
                    <li>
                      <details>
                        <summary>Inputs: (4)</summary>

                        <ul>
                          <li><a href="#">CLIP</a></li>
                          <li><a href="#">VAE</a></li>
                          <li><a href="#">Model</a></li>
                        </ul>
                      </details>
                    </li>
                    <li>
                      <details>
                        <summary>Outputs: (4)</summary>

                        <ul>
                          <li><a href="#">Image</a></li>
                          <li><a href="#">Image</a></li>
                          <li><a href="#">Image</a></li>
                        </ul>
                      </details>
                    </li>
                  </ul>
                </details>
              </li>
              <li>
                <details>
                  <summary>todo: add permalinks to each node</summary>

                  <ul>
                    <li>
                      <details>
                        <summary>Inputs: (4)</summary>

                        <ul>
                          <li><a href="#">CLIP</a></li>
                          <li><a href="#">VAE</a></li>
                          <li><a href="#">Model</a></li>
                        </ul>
                      </details>
                    </li>
                    <li>
                      <details>
                        <summary>Outputs: (4)</summary>

                        <ul>
                          <li><a href="#">Image</a></li>
                          <li><a href="#">Image</a></li>
                          <li><a href="#">Image</a></li>
                        </ul>
                      </details>
                    </li>
                  </ul>
                </details>
              </li>
            </ul>
          </details>
        </li>
      </menu>
    </div>
  </div>
  <footer class="footer text-xs grid-rows-2 gap-2 p-4 px-8">
    <a class="link btn btn-sm btn-ghost font-normal flex items-center gap-2" href="https://github.com/chinsuko-chan/goodUI" target="_blank" rel="noopener">
      <span>{@html ghLogoSvg}</span>
      goodUI
    </a>
    <a class="link btn btn-sm btn-ghost font-normal flex items-center gap-2" href="https://x.com/chinsuko_chan" target="_blank" rel="noopener">
      <span>{@html twtSvg}</span>
      @chinsuko_chan
    </a>
  </footer>
{/snippet}

{#snippet navbar()}
  <nav class="navbar gap-2 mb-12">
    <div class="justify-start">
      <label for={DRAWER_ID} class="btn btn-ghost btn-circle lg:hidden">
        {@html menuSvg}
      </label>
    </div>

    <div class="navbar-center flex-grow">
      <WorkflowSelector />
    </div>

    <div class="navbar-end">
      <WorkflowRunButton />
    </div>
  </nav>
{/snippet}

<div class="container mx-auto">
  <main class="bg-base-100 drawer lg:drawer-open">
    <input id={DRAWER_ID} type="checkbox" class="drawer-toggle" />

    <div class="drawer-side border-r-2 z-10">
      <label for={DRAWER_ID} class="drawer-overlay"></label>
      <aside class="flex flex-col bg-base-100 min-h-screen w-80">
        {@render sidebar()}
      </aside>
    </div>

    <div class="drawer-content">
      {@render navbar()}
      <WorkflowContents />
    </div>
  </main>
  <ApiConfigModal bind:apiConfigModal={apiConfigModal} />
</div>

<style>
  .drawer-side {
    scroll-behavior: smooth;
    scroll-padding-top: 5rem;
  }
</style>
