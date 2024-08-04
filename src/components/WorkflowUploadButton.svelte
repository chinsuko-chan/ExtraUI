<script>
  import { connectWorkflowManager } from "../stores/workflowManager.svelte"

  const manager = connectWorkflowManager()
  let dropzoneFocused = false

  function ondragenter(e) {
    e.stopPropagation()
    e.preventDefault()
    dropzoneFocused = true
  }

  function ondragleave(e) {
    dropzoneFocused = false
  }

  function ondragover(e) {
    e.stopPropagation()
    e.preventDefault()
    dropzoneFocused = true
  }

  /** actual logic here */
  function handleFiles(files) {
    const newWorkflows = JSON.parse(JSON.stringify(manager.workflows))
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith("application/json")) continue

      const reader = new FileReader()
      reader.onload = (e) => {
        const key = file.name.replace(/\.json$/i, "")
        if (manager.workflows[key]) {
          const yes = confirm(
            `Workflow named "${key}" already exists, overwrite?`,
          )
          if (!yes) return
        }

        newWorkflows[key] = JSON.parse(e.target.result)
        manager.workflows = newWorkflows
        manager.save()
      }
      reader.readAsText(file)
    }
  }

  function ondrop(e) {
    e.stopPropagation()
    e.preventDefault()

    const dt = e.dataTransfer
    const files = dt.files
    if (!files || !files.length) return

    handleFiles(files)
  }

  function onchange(e) {
    const files = e.target.files
    if (!files || !files.length) return

    handleFiles(files)
  }
</script>

<span
  tabindex="0"
  role="button"
  class:border-dashed={dropzoneFocused}
  class:btn-primary={dropzoneFocused}
  class="btn btn-block btn-sm btn-outline"
  {ondrop}
  {ondragover}
  {ondragenter}
  {ondragleave}
>
  <label>
    <input
      type="file"
      id="workflowUploadButton"
      multiple
      accept="application/json"
      class="hidden"
      {onchange}
    />
    <span>Import Workflow</span>
  </label>
</span>
