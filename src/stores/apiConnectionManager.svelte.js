const CLIENT_ID = "goodUI"

/**
 * urls:
 * /ws
 * /prompt
 * /history/{prompt_id}
 * /view?filename={filename}&type={type}(&subfolder=%{subfolder})
 */

/** whitelist of messages we care about from server */
const MESSAGES = ["status"]

export const STATUS = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTING: "CONNECTING",
  IDLE: "IDLE",
  RUNNING: "RUNNING",
  ERROR: "ERROR",
}

const SERVER_URI_KEY = "goodUI.stores.apiConnectionManager.serverUri"

/** server without the protocol (no http:// or ws:// in front) */
let serverUri = $state(
  JSON.parse(localStorage.getItem(SERVER_URI_KEY) || "null"),
)
let socket
let status = $state(STATUS.DISCONNECTED)

/**
 * FUNCTIONS
 */

const onOpen = (_event) => (status = STATUS.IDLE)
const onMessage = (event) => {
  const data = JSON.parse(event.data)
  if (MESSAGES.includes(data.type)) {
    console.log("< ", data)
  }
}

export const api = {
  get uri() {
    return serverUri
  },
  set uri(newUri) {
    serverUri = newUri
    localStorage.setItem(SERVER_URI_KEY, JSON.stringify(newUri))
  },
  get status() {
    return status
  },
  get socket() {
    return socket
  },
  connect() {
    socket?.close() // if doing reconnect
    status = STATUS.CONNECTING
    try {
      socket = new WebSocket(`ws://${serverUri}/ws?client_id=${CLIENT_ID}`)

      // Add event listeners
      socket.addEventListener("open", onOpen)
      socket.addEventListener("message", onMessage)
    } catch (e) {
      console.error(e)
      status = STATUS.ERROR
    }
  },
  disconnect() {
    try {
      socket?.close()
    } catch {}
    status = STATUS.DISCONNECTED
  },
}
