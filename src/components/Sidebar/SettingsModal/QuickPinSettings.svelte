<script>
  import settings from "stores/settings.svelte"

  let list = settings.quickPins.join("\n")

  function onSave() {
    settings.quickPins = list.split("\n")
  }
</script>

<h3 class="text-lg font-bold mb-4">Quick Pins</h3>
<p class="text-sm opacity-50">
  Quickly pin these node types on the edit workflow page.
</p>
<label class="form-control">
  <div class="label">
    <span class="label-text">Node types</span>
  </div>
  <textarea
    class="textarea textarea-bordered resize-none"
    placeholder={`CLIPTextEncode\nBNK_CLIPTextEncodeAdvanced`}
    bind:value={list}
    onchange={onSave}
  ></textarea>
  <div class="label">
    <span class="label-text-alt">Separate by newlines</span>
  </div>
</label>

{#if settings.quickPins.length}
  <span>Current:</span>
  <pre
    class="text-xs bg-base-200 w-full px-4 py-2 rounded-md">{settings.quickPins.join(
      "\n",
    )}</pre>
{/if}
