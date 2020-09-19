import { some, none, isSome } from 'fp-ts/lib/Option'
import { reduxMiddlewareFactory } from 'redux-middleware-factory'
import { AnyAction, Dispatch, MiddlewareAPI } from '@reduxjs/toolkit'

import { DefaultWebLoggerOption, Printer } from './types'
import { timer } from './helpers'
import { getDefaultOptions, getDefaultWebPrinter } from './defaults'

const executeAction = (
  next: (a: AnyAction) => AnyAction,
  action: AnyAction,
  shouldLogError: boolean
) => {
  if (shouldLogError) {
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

export const createLogger = <S, E, O>(printer: Printer<S, E, O>, options: O) => {
  return reduxMiddlewareFactory(
    (
      store: MiddlewareAPI<Dispatch<AnyAction>, S>,
      next: Dispatch<AnyAction>,
      action: AnyAction
    ) => {
      const { logError, logPredicate, printLog } = printer
      if (!logPredicate(store.getState(), action)) {
        return next(action)
      } else {
        // Log current time
        const startedTime = new Date()

        // Before log
        const prevTime = timer.now()
        const prevState = store.getState()

        // Execute action
        const result = executeAction(next, action, logError)

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

export const getDefaultLogger = <S, E>() => <S, E>(
  store: MiddlewareAPI<Dispatch<AnyAction>, S>
) => {
  return createLogger<S, E, DefaultWebLoggerOption<S, E>>(
    getDefaultWebPrinter<S, E>(),
    getDefaultOptions<S, E>()
  )(store)
}
