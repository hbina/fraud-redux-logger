import { AnyAction, applyMiddleware, createStore } from '@reduxjs/toolkit'
import { createLogger } from '../src'
import { LogEntry, Printer } from '../src/types'

type TestState = {
  value: number
  actionBefore: ActionType[]
}

enum ActionType {
  PLUS_ONE = 'SET_ONE',
  PLUS_TWO = 'SET_TWO',
  PLUS_THREE = 'SET_THREE',
  SET_THROW = 'SET_THROW',
}

type TestError = {
  error: Error
  message: string
}

const defaultState: TestState = {
  value: 0,
  actionBefore: [],
}

type TestAction = { type: ActionType }

export const reducer = (state = defaultState, action: TestAction) => {
  switch (action.type) {
    case ActionType.PLUS_ONE: {
      return { value: state.value + 1, actionBefore: state.actionBefore.concat(action.type) }
    }
    case ActionType.PLUS_TWO: {
      return { value: state.value + 2, actionBefore: state.actionBefore.concat(action.type) }
    }
    case ActionType.PLUS_THREE: {
      return { value: state.value + 3, actionBefore: state.actionBefore.concat(action.type) }
    }
    case ActionType.SET_THROW: {
      throw Error('I AM THROWING')
    }
    default:
      return { ...state }
  }
}

type CustomOption = {}

const customPrinter: Printer<TestState, TestError, CustomOption> = {
  logError: true,
  logPredicate: (s: TestState, b: AnyAction) => true,
  printLog: (logEntry: LogEntry<TestState, TestError>, customOption: CustomOption) => {
    console.log(`logEntry:${JSON.stringify(logEntry)}`)
  },
}

const createOption = describe('Maps an action of certain type to another type of action.', () => {
  const store = createStore(
    reducer,
    applyMiddleware(createLogger<TestState, TestError, CustomOption>(customPrinter, {}))
  )

  it('Signature must match what redux expects', () => {
    ;[
      { type: ActionType.PLUS_ONE, expected: 1 },
      { type: ActionType.PLUS_TWO, expected: 3 },
      { type: ActionType.PLUS_THREE, expected: 6 },
      { type: ActionType.PLUS_ONE, expected: 7 },
      { type: ActionType.SET_THROW, expected: 7 },
    ].forEach(({ type, expected }) => {
      if (type === ActionType.SET_THROW) {
        try {
          store.dispatch({ type })
          expect(store.getState().value).toEqual(expected)
        } catch (e) {
          expect(e).toEqual(Error('I AM THROWING'))
        }
      } else {
        store.dispatch({ type })
      }
    })
  })
})
