import { some, none, isSome } from 'fp-ts/lib/Option'
import { MiddlewareFunction, reduxMiddlewareFactory } from 'redux-middleware-factory'
import { AnyAction, Dispatch, MiddlewareAPI } from '@reduxjs/toolkit'

import { LogEntry, LoggerOption, LogSwapchain, ExecuteActionResult } from './types'
import { timer } from './helpers'
import { getDefaultOptions } from './defaults'
import { printLog } from './core'

const executeAction: (
  a: (b: AnyAction) => AnyAction,
  c: AnyAction,
  d: boolean
) => ExecuteActionResult = (
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

export const createLogger: <S>(a: LoggerOption<S>) => MiddlewareFunction<S> = <S>(
  options: LoggerOption<S>
) => {
  return reduxMiddlewareFactory<S>(
    (
      store: MiddlewareAPI<Dispatch<AnyAction>, S>,
      next: Dispatch<AnyAction>,
      action: AnyAction
    ) => {
      // Log current time
      const startedTime = new Date()

      // Before log
      const prevTime = timer.now()
      const prevState = store.getState()
      const transformedPrevState = options.stateTransformer(prevState)

      // Execute action
      const result = executeAction(next, action, options.logErrors)

      // After log
      const nextTime = timer.now()
      const nextState = store.getState()
      const transformedNextState = options.stateTransformer(nextState)

      // Process difference
      const tookTime = nextTime - prevTime
      console.log(`prevTime:${prevTime} nextTime:${nextTime} tookTime:${tookTime}`)

      // Create log
      const logEntry: Readonly<LogEntry<S>> = {
        action: action,
        error: result.error,
        startedTime: startedTime,
        took: tookTime,
        prevState: prevState,
        nextState: nextState,
      }

      const shouldLogDiff = options.diffPredicate(nextState, action)

      // Print log
      printLog(logEntry, options, shouldLogDiff)

      // Emit the error that we captured.
      // However, I am pretty sure that it does not matter because other people must have thrown it as well.
      if (isSome(logEntry.error)) {
        throw logEntry.error.value
      } else {
        return result.result
      }
    }
  )
}

export const defaultLogger: <S>(
  a: MiddlewareAPI<Dispatch<AnyAction>, S>
) => (b: Dispatch<AnyAction>) => (c: AnyAction) => AnyAction = <S>(
  store: MiddlewareAPI<Dispatch<AnyAction>, S>
) => {
  return createLogger<S>(getDefaultOptions<S>())(store)
}
