import { version } from '../package.json'
import { session } from './state'
import { Ac, Tx } from './interfaces'

import { Emitter, EventObject, NotificationObject } from './interfaces'

export function removeAccount(clientIndex: number, address: string) {
  session.clients[clientIndex].accounts = session.clients[clientIndex].accounts.filter(
    (ac: Ac) => ac.address !== address
  )
}

export function removeTransaction(clientIndex: number, hash: string) {
  session.clients[clientIndex].transactions = session.clients[clientIndex].transactions.filter(
    (tx: Tx) => tx.hash !== hash
  )
}

export function createEmitter(): Emitter {
  return {
    listeners: {},
    on: function(eventCode, listener) {
      // check if valid eventCode
      switch (eventCode) {
        case 'txSent':
        case 'txPool':
        case 'txConfirmed':
        case 'txSpeedUp':
        case 'txCancel':
        case 'txFailed':
        case 'all':
          break
        default:
          throw new Error(
            `${eventCode} is not a valid event code, for a list of valid event codes see: https://github.com/blocknative/sdk`
          )
      }

      // check that listener is a function
      if (typeof listener !== 'function') {
        throw new Error('Listener must be a function')
      }

      // add listener for the eventCode
      this.listeners[eventCode] = listener
    },
    emit: function(state) {
      if (this.listeners[state.eventCode]) {
        return this.listeners[state.eventCode](state)
      }

      if (this.listeners.all) {
        return this.listeners.all(state)
      }
    }
  }
}

export function createEventLog(msg: EventObject): string {
  const { dappId, networkId } = session

  return JSON.stringify({
    timeStamp: new Date(),
    dappId,
    version,
    blockchain: {
      system: 'ethereum',
      network: networkName(networkId)
    },
    ...msg
  })
}

export function networkName(id: number): string {
  switch (id) {
    case 1:
      return 'main'
    case 3:
      return 'ropsten'
    case 4:
      return 'rinkeby'
    case 5:
      return 'goerli'
    case 42:
      return 'kovan'
    default:
      return 'local'
  }
}

export function serverEcho(eventCode: string): boolean {
  switch (eventCode) {
    case 'txRequest':
    case 'nsfFail':
    case 'txRepeat':
    case 'txAwaitingApproval':
    case 'txConfirmReminder':
    case 'txSendFail':
    case 'txError':
    case 'txUnderPriced':
    case 'txSent':
      return true
    default:
      return false
  }
}

export function last(
  arr: (undefined | boolean | NotificationObject)[]
): undefined | boolean | NotificationObject {
  return arr.reverse()[0]
}
