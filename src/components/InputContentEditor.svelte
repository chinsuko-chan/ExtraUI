<script>
  // (observation) workflow inputs are usually:
  // - json value (eg. string, int)
  // - array
  // - object of unknown shape (nesting optional)
  //
  // this component accepts 2 inputs:
  // - original object
  // - update function
  //
  // and creates an appropriate editable element based on the content

  let { value } = $props()
</script>

<span>{JSON.stringify(value)}</span>
