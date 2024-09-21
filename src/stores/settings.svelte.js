import localStore from "lib/localStore"

// keys
const QUICK_PINS_KEY = "extraUI.stores.settings.quickPins"

// init
const localQuickPins = localStore(QUICK_PINS_KEY, [])

// state
let quickPins = $state(localQuickPins.current)

export default {
  get quickPins() {
    return quickPins
  },
  set quickPins(newStateAry) {
    quickPins = newStateAry
    localQuickPins.save(quickPins)
  },
}
