const KEY = "extraUI.stores.imageCache"
const DB_VERSION = 1

import { api } from "./api.svelte"

const initDb = () => {
  const request = indexedDB.open(KEY, DB_VERSION)
  request.onupgradeneeded = (e) => {
    console.trace("db upgraded")
    const database = e.target.result

    /**
     * rows look like dis:
     * [ key, workflow_name, node_id, node_output_key, node_output_idx, type, filename, blob, workflow, workflowSearch ]
     *
     * key (string) shape = "workflow.node_id.node_output_key.node_output_idx.type.filename"
     */
    const imageStore = database.createObjectStore("images", { keyPath: "key" })

    /** index workflow name */
    imageStore.createIndex("workflowName", "workflowName", { unique: false })

    /** index a stringified version of the workflow */
    imageStore.createIndex("workflowSearch", "workflowSearch", {
      unique: false,
    })

    imageStore.transaction.oncomplete = (e) =>
      console.trace("db initialized", e)
  }

  return new Promise((resolve, _reject) => {
    // result here is the db itself
    request.onsuccess = (e) => resolve(e.target.result)
  })
}

const db = await initDb()
export function getImage(key) {
  const txn = db.transaction(["images"], "readwrite")
  const imgRequest = txn.objectStore("images").get(key)
  return new Promise((resolve, reject) => {
    imgRequest.onsuccess = (e) => resolve(e.target.result)
    imgRequest.onerror = (e) => {
      console.warn(`Failed to load image, key = "${key}"`)
    }
  })
}

export function saveImage({
  key,
  workflowName,
  nodeId,
  inputKey,
  type,
  filename,
  blob,
  workflow,
  workflowSearch,
}) {
  const txn = db.transaction(["images"], "readwrite")
  const imgRequest = txn.objectStore("images").add({
    key,
    workflowName,
    nodeId,
    inputKey,
    type,
    filename,
    blob,
    workflow,
    workflowSearch,
  })

  return new Promise((resolve, reject) => {
    // result here is the key
    imgRequest.onsuccess = (e) => resolve(e.target.result)
    imgRequest.onerror = (e) => {
      reject(e.target.error)
      // not using promise resulting value, so just log and move on
      const reason = e.target.error?.message
      if (reason !== "Key already exists in the object store") {
        throw e.target.error
      }

      console.warn(`Skipping, image key already exists: "${key}"`)
    }
  })
}

/** MAIN FN: fetch single image from cache or API */
export default async function fetchImage(
  workflowName,
  workflowObj,
  { nodeId, inputKey, attributes },
) {
  const dbValues = [
    workflowName,
    nodeId,
    inputKey,
    attributes.type,
    attributes.filename,
  ]

  const key = dbValues.join(".")
  const cachedResult = await getImage(key)
  if (cachedResult) {
    /** @hack idk if this is dvelopment side effect but cba rn */
    const malformedBlob = !cachedResult.blob?.size
    return {
      nodeId: cachedResult.nodeId,
      inputKey,
      filename: attributes.filename,
      blob: malformedBlob ? null : cachedResult.blob,
    }
  }

  // else, cache miss. fetch by img attributes
  const blob = await api.view(attributes)
  const insertValues = {
    key,
    workflowName,
    nodeId,
    inputKey,
    type: attributes.type,
    filename: attributes.filename,
    blob,
    workflow: workflowObj,
    workflowSearch: JSON.stringify(workflowObj),
  }

  await saveImage({ ...insertValues })
  return {
    nodeId,
    inputKey,
    filename: attributes.filename,
    blob: blob,
  }
}

export async function pollImages(workflowName, workflowObj, promptApiResult) {
  const out = {}
  const promises = Object.entries(promptApiResult).reduce(
    (flattened, [nodeId, outputs]) => {
      Object.entries(outputs).forEach(([inputKey, imagesArray]) => {
        imagesArray.forEach((attributes) => {
          flattened.push(
            fetchImage(workflowName, workflowObj, {
              nodeId,
              inputKey,
              attributes,
            }),
          )
        })
      })
    },
    [],
  )
  const fmt = await Promise.all(promises)

  fmt.forEach(({ nodeId, inputKey, filename, blob }) => {
    out[nodeId] ||= {}
    out[nodeId][inputKey] ||= []
    out[nodeId][inputKey].push([filename, blob])
  })

  return out
}
