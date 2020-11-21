import { applyMiddleware, createStore } from '@reduxjs/toolkit'
import { createLogger } from '../src'
import { DefaultWebLoggerOption } from '../src/types'
import { getDefaultWebPrinter, getDefaultOptions } from '../src/defaults'

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

class MockConsole {
}

describe('Test default logger specialized for the web.', () => {
  const mockOption = {
    ...getDefaultOptions<TestState, TestError>(),
    console: MockConsole,
  }
  const mockMiddleware = createLogger<
    TestState,
    TestError,
    DefaultWebLoggerOption<TestState, TestError>
  >(getDefaultWebPrinter<TestState, TestError>(), mockOption)
  const store = createStore(reducer, applyMiddleware(mockMiddleware))

  it('Execute a bunch of actions and test the output', () => {
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
