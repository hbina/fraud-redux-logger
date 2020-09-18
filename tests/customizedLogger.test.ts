import { AnyAction, applyMiddleware, createStore } from '@reduxjs/toolkit'
import { createLogger } from '../src'
import { LogEntry, LoggerOption, LogLevel } from '../src/types'

enum ActionType {
  PLUS_ONE = 'SET_ONE',
  PLUS_TWO = 'SET_TWO',
  PLUS_THREE = 'SET_THREE',
  SET_THROW = 'SET_THROW',
}

type TestState = {
  value: number
  actionBefore: ActionType[]
}

type TransformedState = {
  state: TestState
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

type TransformedAction = {
  type: ActionType
  message: string
}

type TestError = {
  error: any
}

type TransformedError = {
  error: TestError
  message: string
}

const customOptions: LoggerOption<
  TestState,
  TestError,
  TransformedState,
  TransformedAction,
  TransformedError
> = {
  logLevel: {
    prevState: (a: TransformedAction, b: TestState) => {
      if (b.actionBefore.includes(a.type)) {
        return LogLevel.LOG
      } else {
        return LogLevel.WARN
      }
    },
    action: (a: TransformedAction) => {
      switch (a.type) {
        case ActionType.PLUS_ONE: {
          return LogLevel.ERROR
        }
        case ActionType.PLUS_TWO: {
          return LogLevel.INFO
        }
        case ActionType.PLUS_THREE: {
          return LogLevel.LOG
        }
        case ActionType.SET_THROW: {
          return LogLevel.WARN
        }
        default: {
          return LogLevel.LOG
        }
      }
    },
    error: (a: TransformedAction, b: TestError, c: TestState) => LogLevel.LOG,
    nextState: (a: TransformedAction, b: TestState) => LogLevel.LOG,
  },
  logger: console,
  showError: true,
  collapsed: (a: TestState, b: TestAction, c: LogEntry<TestState, TestError, TransformedState>) =>
    false,
  predicate: (a: TestState, b: TestAction) => true,
  showDuration: false,
  showTimestamp: true,
  stateTransformer: (state: TestState) => {
    return {
      state: state,
      message: 'transformed state!',
    }
  },
  actionTransformer: (action: TestAction) => {
    return {
      type: action.type,
      message: 'transformed action!',
    }
  },
  errorTransformer: (error: TestError) => {
    return {
      error: error,
      message: 'transformed error!',
    }
  },
  colors: {
    title: () => 'inherit',
    prevState: () => '#9E9E9E',
    action: () => '#03A9F4',
    nextState: () => '#4CAF50',
    error: () => '#F20404',
  },
  diffPredicate: (_a: TestState, _b: TestAction) => false,
}

const createOption = describe('Maps an action of certain type to another type of action.', () => {
  const store = createStore(reducer, applyMiddleware(createLogger(customOptions)))

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
