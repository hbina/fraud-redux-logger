import { timer } from './helpers'
import { getDefaultOptions } from './defaults'
import { LogEntry, LoggerOption, LogSwapchain, ExecuteActionResult } from './types'
import { some, none, Option } from 'fp-ts/lib/Option'
import { MiddlewareFunction, reduxMiddlewareFactory } from 'redux-middleware-factory'
import { AnyAction, Dispatch, MiddlewareAPI } from '@reduxjs/toolkit'
// import { diff } from 'deep-diff'
import { renderDiff } from './diff'

const executeAction: <S>(
  next: (a: AnyAction) => AnyAction,
  action: AnyAction,
  a: LoggerOption<S>
) => ExecuteActionResult = <S>(
  next: (a: AnyAction) => AnyAction,
  action: AnyAction,
  option: LoggerOption<S>
) => {
  if (option.logErrors) {
    /// TODO :: Is this a right way to handle throwing actions?
    try {
      return {
        result: next(action),
        error: none
      }
    } catch (error) {
      return {
        result: action,
        error: some(error)
      }
    }
  } else {
    return {
      result: next(action),
      error: none
    }
  }
}

// NOTE: This is a terrible hack.
//       There should be a more functional way of doing this but I am not sure if it can be transparent to the user.
//       We are just a middleware.
let swapchain: LogSwapchain = {
  before: none,
  after: none
}

export const createLogger: <S>(options: LoggerOption<S>) => MiddlewareFunction<S> = <S>(
  options: LoggerOption<S>
) => {
  return reduxMiddlewareFactory(
    <S, D extends Dispatch<AnyAction>>(store: MiddlewareAPI<D, S>, next: D, action: AnyAction) => {
      // Before log
      const beforeTime = timer.now()
      const beforeState = store.getState()
      // TODO :: What does this error even mean?
      // const transformedBeforeState = options.stateTransformer(beforeState)
      const result = executeAction(next, action, options)

      // After log
      const afterState = store.getState()
      const afterTime = timer.now()

      // Process difference
      // diff(beforeState, afterState)?.forEach(diff =>
      //  console.log(`diff:${JSON.stringify(renderDiff(diff))}`)
      // )
      const tookTime = beforeTime - afterTime
      console.log(`beforeTime:${beforeTime} afterTime:${afterTime} tookTime:${tookTime}`)

      // Create log
      const logEntry: LogEntry<S> = {
        action: action,
        error: result.error,
        startedTime: new Date(),
        took: tookTime,
        prevState: beforeState,
        nextState: afterState
      }
      // Print log
      // TODO :: Same problem as above.
      // printLog(logEntry, options)
      return result.result
    }
  )
}

export const defaultLogger = <S>(store: MiddlewareAPI<Dispatch<AnyAction>, S>) => {
  return createLogger(getDefaultOptions<S>())(store)
}
