<script>
  import workflowStore from "stores/workflows.svelte"

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
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith("application/json")) continue

      const reader = new FileReader()
      reader.onload = (e) => {
        const key = file.name.replace(/\.json$/i, "")

        workflowStore.setWorkflowByName(key, JSON.parse(e.target.result))
        workflowStore.save()
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
    <span>Add Workflow</span>
  </label>
</span>
