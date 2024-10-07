<script>
  let { blob, classNames = "", alt = "img" } = $props()

  let src = $derived.by(() => {
    return URL.createObjectURL(blob)
  })

  $effect(() => {
    if (!src) return
    return URL.revokeObjectURL(src)
  })
</script>

<img class={classNames} {alt} {src} />
