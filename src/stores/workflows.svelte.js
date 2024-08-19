import connect from "lib/localStore"

const WORKFLOWS_KEY = "goodUI.stores.workflow.allWorkflows"
const CHANGES_KEY = "goodUI.stores.workflow.allChanges"

const localWorkflows = connect(WORKFLOWS_KEY, {})
const localChanges = connect(CHANGES_KEY, {})

// These are "raw" , not meant to be consumed directly
let allWorkflows = $state(localWorkflows.current)
let allChanges = $state(localChanges.current)

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
  save() {
    localWorkflows.save(allWorkflows)
  },
}

// util

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
    get hasChanges() {
      return workflowHasChanges(workflowName)
    },
  }
}

export function connectNode(workflowName, nodeId) {
  return {
    get current() {
      return getNode(workflowName, nodeId)
    },
    get hasChanges() {
      return nodeHasChanges(workflowName, nodeId)
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
    },
    get isChanged() {
      return inputHasChanges(workflowName, nodeId, inputKey)
    },
  }
}
