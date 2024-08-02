<script>
  function ondragenter(e) {
    e.stopPropagation()
    e.preventDefault()
  }

  function ondragover(e) {
    e.stopPropagation()
    e.preventDefault()
  }

  function ondrop(e) {
    e.stopPropagation()
    e.preventDefault()

    const dt = e.dataTransfer
    const files = dt.files
    if (!files || !files.length) return

    console.log(files)
  }

  function onchange(e) {
    const files = e.target.files
    if (!files || !files.length) return

    console.log(files)
  }
</script>

<span {ondrop} {ondragover} {ondragenter}>
  <label class="btn btn-primary btn-outline btn-sm">
    <input
      type="file"
      id="workflowUploadButton"
      multiple
      accept="image/*"
      class="hidden"
      {onchange}
    />
    <span>Import Workflow</span>
  </label>
</span>
