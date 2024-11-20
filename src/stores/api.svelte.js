const CLIENT_ID = "extraUI"

/**
 * urls:
 * /ws
 * /prompt
 * /history/{prompt_id}
 * /view?filename={filename}&type={type}(&subfolder=%{subfolder})
 * /object_info/{node_class}
 */

export const STATUS = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTING: "CONNECTING",
  IDLE: "IDLE",
  RUNNING: "RUNNING",
  ERROR: "ERROR",
}

export const SERVER_URI_PLACEHOLDER = "localhost:8188"

import localStore from "lib/localStore"

const SERVER_URI_KEY = "extraUI.stores.apiConnectionManager.serverUri"
const IGNORELIST_KEY = "extraUI.stores.apiConnectionManager.ignorelist"
const AUTOCONNECT_KEY = "extraUI.stores.apiConnectionManager.autoconnect"

const localServerUri = localStore(SERVER_URI_KEY, SERVER_URI_PLACEHOLDER)
const localIgnorelist = localStore(IGNORELIST_KEY, [])
const localAutoconnect = localStore(AUTOCONNECT_KEY, null)

/** server without the protocol (no http:// or ws:// in front) */
let serverUri = $state(localServerUri.current)
let ignorelist = $state(localIgnorelist.current)
let autoconnect = $state(localAutoconnect.current)

let socket
let attemptingDisconnect = false
let status = $state(STATUS.DISCONNECTED)

/**
 * FUNCTIONS
 */

const onOpen = (_event) => (status = STATUS.IDLE)
const onMessage = (event) => {
  const payload = JSON.parse(event.data)
  if (ignorelist.includes(payload.type)) return

  console.group("api.onMessage")
  console.log("<", { type: payload.type })
  console.log(payload.data)
  console.groupEnd()

  // check if queue updated
  if (payload.type === "status" && payload?.data?.status?.exec_info) {
    const execInfo = payload.data.status.exec_info
    if (typeof execInfo.queue_remaining === "number") {
      if (execInfo.queue_remaining === 0) status = STATUS.IDLE
    }
  }
}
const onError = () => {
  /** @gotcha IDK wtf im doing wrong but close() ALWAYS causes an error  */
  if (attemptingDisconnect) {
    attemptingDisconnect = false
    return (status = STATUS.DISCONNECTED)
  }

  status = STATUS.ERROR
}

function connect() {
  socket?.close() // if doing reconnect
  status = STATUS.CONNECTING
  socket = new WebSocket(`ws://${serverUri}/ws?client_id=${CLIENT_ID}`)

  // Add event listeners
  socket.onopen = onOpen
  socket.onmessage = onMessage
  socket.onerror = onError
}

/** try, wait for 3s, then fail */
function tryConnect() {
  setTimeout(() => {
    if (socket && socket.readyState === WebSocket.CONNECTING) {
      attemptingDisconnect = false
      socket.close(1000, "ur too slow bro")
    }
  }, 3000)

  connect()
}

export const api = {
  get uri() {
    return serverUri
  },
  set uri(newUri) {
    serverUri = newUri
    localServerUri.save(serverUri)
  },
  get status() {
    return status
  },
  get isIdle() {
    return status === STATUS.IDLE
  },
  get isRunning() {
    return status === STATUS.RUNNING
  },
  get ignorelist() {
    return ignorelist
  },
  set ignorelist(newValues) {
    ignorelist = newValues
    localIgnorelist.save(ignorelist)
  },
  get autoconnect() {
    return autoconnect
  },
  set autoconnect(val) {
    autoconnect = Boolean(val)
    localAutoconnect.save(autoconnect)
  },
  connect: tryConnect,
  disconnect() {
    attemptingDisconnect = true
    socket?.close()
  },
  /** POST payload to /prompt */
  async prompt(workflowObject) {
    if (status !== STATUS.IDLE)
      return console.warn("Skipping execution, not idle.")

    const request = new Request(`http://${serverUri}/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        prompt: workflowObject,
      }),
    })

    status = STATUS.RUNNING
    try {
      const resp = await fetch(request)
      return await resp.json()
    } catch (e) {
      console.error(e)
      return {}
    }
  },
  /** GET /history */
  async history(promptId) {
    const request = new Request(`http://${serverUri}/history/${promptId}`)
    try {
      const resp = await fetch(request)
      return await resp.json()
    } catch (e) {
      console.error(e)
      return {}
    }
  },
  /** GET /view */
  async view({ filename, type, subfolder = "" }) {
    const params = { filename, type }
    if (subfolder.length) params.subfolder = subfolder
    const qs = new URLSearchParams(params)
    const request = new Request(`http://${serverUri}/view?${qs}`)
    try {
      const resp = await fetch(request)
      return await resp.blob()
    } catch (e) {
      console.error(e)
      return {}
    }
  },
  /** POST /upload/image */
  async uploadImage({
    image,
    type = "input",
    subfolder = "",
    overwrite = false,
  }) {
    const formData = new FormData()
    formData.append("image", image)
    formData.append("type", type)
    if (overwrite) formData.append("overwrite", overwrite)
    if (subfolder) formData.append("subfolder", subfolder)

    const request = new Request(`http://${serverUri}/upload/image`, {
      method: "POST",
      body: formData,
    })

    try {
      const resp = await fetch(request)
      return await resp.json()
    } catch (e) {
      console.error(e)
      return {}
    }
  },
  /** GET /object_info/{node_class} */
  async objectInfo(nodeClass) {
    const request = new Request(`http://${serverUri}/object_info/${nodeClass}`)
    try {
      const resp = await fetch(request)
      return await resp.json()
    } catch (e) {
      console.error(e)
      return {}
    }
  },
}

export default function connectApi() {
  if (autoconnect) tryConnect()

  return api
}
