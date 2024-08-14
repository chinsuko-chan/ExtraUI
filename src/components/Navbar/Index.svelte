<script>
  let { drawerId = "workflowDrawer" } = $props()

  import menuSvg from "assets/amburg.svg?raw"

  import runAndGoSvg from "assets/run-n-go.svg?raw"

  import editSvg from "assets/pencil.svg?raw"
  import viewSvg from "assets/eye.svg?raw"
  import workflowSvg from "assets/branch.svg?raw"
</script>

<nav
  class="navbar z-10 gap-2 bg-base-100 bg-opacity-80 shadow-sm backdrop-blur-lg sticky top-0"
>
  <div class="justify-start">
    <label for={drawerId} class="btn btn-ghost btn-circle lg:hidden">
      {@html menuSvg}
    </label>
  </div>

  <div class="navbar-start">
    <button class="btn btn-sm btn-outline btn-success"> Run Workflow </button>
    <button
      class="btn btn-ghost btn-circle border-0 ml-4"
      title="Commit current changes and run the workflow."
    >
      {@html runAndGoSvg}
    </button>
  </div>

  <div class="navbar-center">
    <ul class="menu menu-horizontal bg-base-200 rounded-box">
      <li><button>{@html editSvg}</button></li>
      <li><button>{@html viewSvg}</button></li>
      <li><button>{@html workflowSvg}</button></li>
    </ul>
  </div>

  <div class="navbar-end flex-grow gap-2">
    <button class="btn btn-sm btn-warning">Save</button>
    <button class="btn btn-sm btn-outline btn-error">Revert</button>
  </div>
</nav>
