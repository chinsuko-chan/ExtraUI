import connect from "lib/localStore"

const WORKFLOWS_KEY = "extraUI.stores.workflow.allWorkflows"
const CHANGES_KEY = "extraUI.stores.workflow.allChanges"
const PINNED_INPUTS_KEY = "extraUI.stores.workflow.allPinnedInputs"

const localWorkflows = connect(WORKFLOWS_KEY, {})
const localChanges = connect(CHANGES_KEY, {})
const localPinnedInputs = connect(PINNED_INPUTS_KEY, {})

// These are "raw" , not meant to be consumed directly
let allWorkflows = $state(localWorkflows.current)
let allChanges = $state(localChanges.current)
let allPinnedInputs = $state(localPinnedInputs.current)

// This is the public api shape (array of objs.)
function reduceWorkflows(output, [workflowName, workflow]) {
  const nodes = []
  Object.entries(workflow).forEach(([nodeId, node]) => {
    // 1. inputs
    const { graphInputs, inputs } = Object.entries(node.inputs).reduce(
      (partitioned, [key, value]) => {
        partitioned[Array.isArray(value) ? "graphInputs" : "inputs"].push({
          key,
          value,
        })
        return partitioned
      },
      { graphInputs: [], inputs: [] },
    )

    // 2. outputs
    const graphOutputs = Object.entries(workflow).reduce(
      (gOutputs, [outId, node]) => {
        Object.entries(node.inputs).forEach(([key, value]) => {
          if (value[0] === nodeId) {
            gOutputs.push({
              key,
              value: [outId, -999], // idk howto use 2nd ting yet
            })
          }
        })
        return gOutputs
      },
      [],
    )

    nodes.push({
      ...node,
      id: nodeId,
      inputs,
      graphInputs,
      graphOutputs,
      outputs: [],
    })
  })

  output.push({ name: workflowName, nodes })
  return output
}

let workflows = $derived.by(() => {
  return Object.entries(allWorkflows).reduce(reduceWorkflows, [])
})

let changes = $derived.by(() => {
  return Object.entries(allChanges).reduce(reduceWorkflows, [])
})

function reducePins(output, [workflowName, nodeState]) {
  const nodes = []
  Object.entries(nodeState).forEach(([nodeId, keyState]) => {
    const pinnedKeys = Object.keys(keyState).filter((key) =>
      Boolean(keyState[key]),
    )
    if (!pinnedKeys.length) return

    const keys = pinnedKeys.map((key) => ({ key }))

    nodes.push({ id: nodeId, keys })
  })

  output.push({ name: workflowName, nodes })
  return output
}

// in shape:
// { name: { node: { key } } }
// out shape:
// { name, inputs: { id, keys: { key: string }[] }[] }[]
let workflowPins = $derived.by(() => {
  return Object.entries(allPinnedInputs).reduce(reducePins, [])
})

export default {
  get workflows() {
    return workflows
  },
  setWorkflowByName(name, workflow) {
    allWorkflows[name] = workflow
  },
  get workflowNames() {
    return Object.keys(allWorkflows)
  },
  get workflowPins() {
    return workflowPins
  },
  save() {
    localWorkflows.save(allWorkflows)
  },
}

// util

export function getPinnedNodes(workflowName) {
  return workflowPins.find(({ name }) => name === workflowName)?.nodes || []
}

export function getWorkflow(workflowName, source = null) {
  source ||= workflows
  return source.find(({ name }) => name === workflowName)
}

export function getNode(workflowName, nodeId, source = null) {
  return getWorkflow(workflowName, source)?.nodes?.find(
    ({ id }) => id === nodeId,
  )
}

export function getInput(workflowName, nodeId, inputKey, source = null) {
  const node = getNode(workflowName, nodeId, source)
  if (!node) return undefined
  return (
    node.inputs.find(({ key }) => key === inputKey) ||
    node.graphInputs.find(({ key }) => key === inputKey)
  )
}

export function inputHasChanges(workflowName, nodeId, inputKey) {
  if (!allChanges[workflowName]) return false
  if (!allChanges[workflowName][nodeId]?.inputs) return false

  const changedValue = allChanges[workflowName][nodeId].inputs[inputKey]
  if (changedValue === undefined) return false // love js...

  return allWorkflows[workflowName][nodeId].inputs[inputKey] !== changedValue
}

export function nodeHasChanges(workflowName, nodeId) {
  if (!allChanges[workflowName]) return false
  if (!allChanges[workflowName][nodeId]?.inputs) return false

  return getNode(workflowName, nodeId).inputs.some(({ key }) => {
    return inputHasChanges(workflowName, nodeId, key)
  })
}

export function workflowHasChanges(workflowName) {
  if (!allChanges[workflowName]) return false

  return getWorkflow(workflowName).nodes.some((node) => {
    return nodeHasChanges(workflowName, node.id)
  })
}

// view state helpers

export function connectWorkflow(workflowName) {
  return {
    get current() {
      return getWorkflow(workflowName)
    },
    get currentApi() {
      return allWorkflows[workflowName]
    },
    get hasChanges() {
      return workflowHasChanges(workflowName)
    },
    keepChanges() {
      const newWorkflowState = JSON.parse(JSON.stringify(allWorkflows))
      newWorkflowState[workflowName] ||= {}

      Object.entries(allChanges[workflowName]).forEach(([nodeId, node]) => {
        // tl;dr only care about inputs (for now...)
        Object.entries(node.inputs).forEach(([inputKey, value]) => {
          newWorkflowState[workflowName][nodeId].inputs[inputKey] = value
        })
      })

      allWorkflows[workflowName] = newWorkflowState[workflowName]
      allChanges[workflowName] = {}

      localWorkflows.save(allWorkflows)
      localChanges.save(allChanges)
    },
    revertChanges() {
      allChanges[workflowName] = {}
      localChanges.save(allChanges)
    },
  }
}

export function connectNode(workflowName, nodeId) {
  const node = $derived(getNode(workflowName, nodeId))
  if (!node) throw new Error(`invalid name or id: ${workflowName}, ${nodeId}`)

  return {
    get current() {
      return node
    },
    get hasChanges() {
      return nodeHasChanges(workflowName, nodeId)
    },
    get title() {
      return node?._meta?.title || node?.class_type
    },
    set title(newTitle) {
      allWorkflows[workflowName][nodeId]._meta ||= {}
      allWorkflows[workflowName][nodeId]._meta.title = newTitle
    },
    updateId(newId) {
      const newState = $state.snapshot(allWorkflows[workflowName])
      // 1. update graph outputs (this node targets them)
      // 2. set new contents
      // 3. delete old contents
      getNode(workflowName, nodeId).graphOutputs.forEach(
        ({ key, value: [targetId] }) => {
          const originalInput = newState[targetId].inputs[key]
          newState[targetId].inputs[key] = [newId, originalInput[1]]
        },
      )

      newState[newId] = newState[nodeId]
      delete newState[nodeId]
      allWorkflows[workflowName] = newState
      nodeId = newId

      // todo: save to localStorage ^^; so much stale state rn...
      // - PinnedInput
      // - Node
      // - (probably more)
    },
  }
}

export function connectInput(workflowName, nodeId, inputKey) {
  return {
    get value() {
      return (
        getInput(workflowName, nodeId, inputKey, changes)?.value ||
        getInput(workflowName, nodeId, inputKey)?.value
      )
    },
    set value(newValue) {
      allChanges[workflowName] ||= {}
      allChanges[workflowName][nodeId] ||= { inputs: {} }
      allChanges[workflowName][nodeId].inputs[inputKey] = newValue
      localChanges.save(allChanges)
    },
    get isChanged() {
      return inputHasChanges(workflowName, nodeId, inputKey)
    },
    get isPinned() {
      return !!allPinnedInputs[workflowName]?.[nodeId]?.[inputKey]
    },
    pin() {
      allPinnedInputs[workflowName] ||= {}
      allPinnedInputs[workflowName][nodeId] ||= {}
      allPinnedInputs[workflowName][nodeId][inputKey] = 1
      localPinnedInputs.save(allPinnedInputs)
    },
    unpin() {
      delete allPinnedInputs[workflowName][nodeId][inputKey]
      localPinnedInputs.save(allPinnedInputs)
    },
  }
}
