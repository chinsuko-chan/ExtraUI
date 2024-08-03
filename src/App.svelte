<script>
  /** sidebar is visible at all times >lg */
  const DRAWER_ID = "drawer"
  import menuSvg from "./assets/amburg.svg?raw"
  import ghLogoSvg from "./assets/gh-logo.svg?raw"
  import twtSvg from "./assets/twiddr.svg?raw"

  import WorkflowSelector from "./components/WorkflowSelector.svelte"
  import WorkflowUploadButton from "./components/WorkflowUploadButton.svelte"
</script>

{#snippet sidebar()}
  <header class="sticky top-0 items-center px-4 py-2 flex gap-2">
    <h1 class="font-mono font-bold text-xl md:text-2xl">goodUI</h1>
    <a class="btn btn-ghost" href="https://github.com/chinsuko-chan/goodUI" target="_blank" rel="noopener">
      <span>{@html ghLogoSvg}</span>
    </a>
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
  <footer class="text-xs footer gap-2 p-4 px-8">
    <div class="flex items-center gap-2">
      <span>{@html twtSvg}</span>
      <a class="link" href="https://x.com/chinsuko_chan" target="_blank" rel="noopener">
        @chinsuko_chan
      </a>
      <span>🧡</span>
    </div>
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
      <WorkflowUploadButton />
    </div>
  </nav>
{/snippet}

{#snippet contents()}
  <article class="mx-6 mb-16 xl:mr-2">
  <ul class="timeline timeline-vertical timeline-snap-icon timeline-compact">
    <li>
      <div class="timeline-middle">
        <button class="btn btn-outline btn-xs btn-circle">11</button>
      </div>
      <div class="timeline-end timeline-box">
        <section>
          <h2>
            <a aria-hidden="true" tabindex="-1" href="#heading-1">
              <span class="mr-1 opacity-20 hover:opacity-60 text-base font-bold inline-block align-middle relative -mt-1">#</span>
            </a>
            Load Vae
          </h2>

          <h3 class="font-bold">Inputs</h3>
          <ul>
            <li>hoes</li>
          </ul>

          <h3 class="font-bold">Outputs</h3>
          <ul>
            <li>money</li>
          </ul>
        </section>
      </div>
      <hr />
    </li>
    <li>
      <hr />
      <div class="timeline-middle">
        <button class="btn btn-outline btn-xs btn-circle">2</button>
      </div>
      <div class="timeline-end timeline-box"><section>
        <h2>
          <a aria-hidden="true" tabindex="-1" href="#heading-1">
            <span class="mr-1 opacity-20 hover:opacity-60 text-base font-bold inline-block align-middle relative -mt-1">#</span>
          </a>
          Load Clip
        </h2>

        <h3 class="font-bold">Inputs</h3>
        <ul>
          <li>hoes</li>
        </ul>

        <h3 class="font-bold">Outputs</h3>
        <ul>
          <li>money</li>
        </ul>
      </section></div>
      <hr />
    </li>
    <li>
      <hr />
      <div class="timeline-middle">
        <button class="btn btn-outline btn-xs btn-circle">3</button>
      </div>
      <div class="timeline-end timeline-box"><section>
        <h2>
          <a aria-hidden="true" tabindex="-1" href="#heading-1">
            <span class="mr-1 opacity-20 hover:opacity-60 text-base font-bold inline-block align-middle relative -mt-1">#</span>
          </a>
          Load Checkpoint
        </h2>
      </section></div>
      <hr />
    </li>
    <li>
      <hr />
      <div class="timeline-middle">
        <button class="btn btn-outline btn-xs btn-circle">69</button>
      </div>
      <div class="timeline-end timeline-box"><section>
        <h2>
          <a aria-hidden="true" tabindex="-1" href="#heading-1">
            <span class="mr-1 opacity-20 hover:opacity-60 text-base font-bold inline-block align-middle relative -mt-1">#</span>
          </a>
          I love you
        </h2>
      </section></div>
      <hr />
    </li>
    <li>
      <hr />
      <div class="timeline-middle">
        <button class="btn btn-outline btn-xs btn-circle">420</button>
      </div>
      <div class="timeline-end timeline-box"><section>
        <h2>
          <a aria-hidden="true" tabindex="-1" href="#heading-1">
            <span class="mr-1 opacity-20 hover:opacity-60 text-base font-bold inline-block align-middle relative -mt-1">#</span>
          </a>
          There is no meme
        </h2>
      </section></div>
    </li>
  </ul>
  </article>
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
      {@render contents()}
    </div>
  </main>
</div>

<style>
  .drawer-side {
    scroll-behavior: smooth;
    scroll-padding-top: 5rem;
  }
</style>
