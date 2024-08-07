const KEY = "goodUI.stores.imageCache"
const DB_VERSION = 1

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

export const cache = {
  get db() {
    return db
  },
  getImage(key) {
    const txn = db.transaction(["images"], "readwrite")
    const imgRequest = txn.objectStore("images").get(key)
    return new Promise((resolve, reject) => {
      imgRequest.onsuccess = (e) => resolve(e.target.result)
      imgRequest.onerror = (e) => {
        console.warn(`Failed to load image, key = "${key}"`)
      }
    })
  },
  saveImage({
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
  },
}
