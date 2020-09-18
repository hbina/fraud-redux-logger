import { some, none, isSome } from 'fp-ts/lib/Option'
import { MiddlewareFunction, reduxMiddlewareFactory } from 'redux-middleware-factory'
import { Action, AnyAction, Dispatch, MiddlewareAPI } from '@reduxjs/toolkit'

import { LogEntry, LoggerOption, LogSwapchain, ExecuteActionResult } from './types'
import { timer } from './helpers'
import { getDefaultOptions } from './defaults'
import { printLog } from './core'

const executeAction = (
  next: (a: AnyAction) => AnyAction,
  action: AnyAction,
  shouldLogError: boolean
) => {
  if (shouldLogError) {
    /// TODO :: Is this a right way to handle throwing actions?
    try {
      return {
        result: next(action),
        error: none,
      }
    } catch (error) {
      return {
        result: action,
        error: some(error),
      }
    }
  } else {
    return {
      result: next(action),
      error: none,
    }
  }
}

export const createLogger = <S, TS, TA, E, TE>(options: LoggerOption<S, TS, TA, E, TE>) => {
  return reduxMiddlewareFactory(
    (
      store: MiddlewareAPI<Dispatch<AnyAction>, S>,
      next: Dispatch<AnyAction>,
      action: AnyAction
    ) => {
      const { logPredicate } = options
      if (!logPredicate(store.getState(), action)) {
        return next(action)
      } else {
        // Log current time
        const startedTime = new Date()

        // Before log
        const prevTime = timer.now()
        const prevState = store.getState()

        // Execute action
        const result = executeAction(next, action, options.showError)

        // After log
        const nextTime = timer.now()
        const nextState = store.getState()

        // Process difference
        const tookTime = nextTime - prevTime

        // Create log
        const logEntry = {
          action: action,
          error: result.error,
          startedTime: startedTime,
          took: tookTime,
          prevState: prevState,
          nextState: nextState,
        }

        // Print log
        printLog(logEntry, options)

        // Emit the error that we captured.
        // However, I am pretty sure that it does not matter because other people must have thrown it as well.
        if (isSome(logEntry.error)) {
          throw logEntry.error.value
        } else {
          return result.result
        }
      }
    }
  )
}

export const defaultLogger = <S, E>(store: MiddlewareAPI<Dispatch<AnyAction>, S>) => {
  return createLogger(getDefaultOptions<S, E>())(store)
}
