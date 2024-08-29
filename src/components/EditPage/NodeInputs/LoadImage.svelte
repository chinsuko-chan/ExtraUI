<script>
  import { untrack } from "svelte"

  // primitive is the fallback for everything that doesn't need custom
  let { workflowName, id, inputs } = $props()

  import { api } from "stores/api.svelte"
  import { connectInput } from "stores/workflows.svelte"
  let inputStore = $derived(connectInput(workflowName, id, inputs[0].key))

  import { connectWorkflow } from "stores/workflows.svelte"
  let workflow = $derived(connectWorkflow(workflowName))

  // shape of `inputs` for posterity (real)
  // [
  //   { key: "image", value: "example.png" },
  //   { key: "upload", value: "image" }
  // ]

  import fetchImage from "stores/imageCache.svelte"

  let currentImage = $state()
  $effect(async () => {
    currentImage = await fetchImage(
      workflowName,
      $state.snapshot(workflow.currentApi),
      {
        nodeId: id,
        inputKey: inputs[0].key, // lit. "image"
        attributes: {
          type: "input",
          filename: inputStore.value,
          // subfolder not needed??
        },
      },
    )
    untrack(() => currentImage)
  })

  let fileUpload

  async function uploadAndSelectFile() {
    const result = await api.uploadImage({ image: fileUpload.files[0] })

    const newFile = result.name
    inputStore.value = newFile
  }
</script>

<div class="grid grid-cols-2 gap-2 pb-2">
  <input bind:this={fileUpload} type="file" onchange={uploadAndSelectFile} />
  {#if currentImage}
    <img class="max-h-96" src={currentImage.blob} alt={currentImage.filename} />
  {:else}
    <code>{inputs[0].value}</code>
  {/if}
</div>
