import printBuffer from './core'
import { timer } from './helpers'
import defaults from './defaults'
import { LogEntry, LoggerOption, ReduxAction, ReduxError, ReduxState } from './types'
import { time } from 'console'
import { isSome, some, none, Option, isNone } from 'fp-ts/lib/Option'
import { Either, left, right } from 'fp-ts/lib/Either'
import { state } from 'fp-ts/lib/State'

const executeAction: (
  a: LoggerOption,
  next: any,
  action: ReduxAction
) => // Factorize out  this product type?
{ result: ReduxState; error: Option<ReduxError> } = (option, next, action) => {
  let result
  let error = none
  if (option.logErrors) {
    try {
      result = next(action)
    } catch (e) {
      error = option.errorTransformer(e)
    }
    return {
      result: result,
      error: some(error)
    }
  } else {
    result = next(action)
    return {
      result: result,
      error: none
    }
  }
}

const createLogger: (
  options: LoggerOption
) =>
  | (() => (next: (action: ReduxAction) => ReduxAction) => (action: ReduxAction) => ReduxAction)
  | (({
      getState
    }: {
      getState: () => ReduxState
    }) => (
      next: (action: ReduxAction) => ReduxAction
    ) => (action: ReduxAction) => ReduxAction) = options => {
  const loggerOptions: LoggerOption = Object.assign({}, defaults, options)

  const {
    logger,
    stateTransformer,
    errorTransformer,
    predicate,
    logErrors,
    diffPredicate
  } = loggerOptions

  // Return if 'console' object is not defined
  if (isNone(logger)) {
    console.log('what')
    return () => (next: (arg0: any) => any) => (action: any) => next(action)
  }

  // Detect if 'createLogger' was passed directly to 'applyMiddleware'.
  // if (options.getState && options.dispatch) {
  //   return () => (next: (arg0: any) => any) => (action: any) => next(action)
  // }

  const logBuffer: LogEntry[] = []

  return ({ getState }: any) => (next: (arg0: any) => any) => (action: ReduxAction) => {
    // Exit early if predicate function returns 'false'
    if (isSome(predicate) && !predicate.value(getState, action)) {
      return next(action)
    }

    const started = timer.now()
    const startedTime = new Date()
    const prevState = stateTransformer(getState())
    const took = timer.now() - started
    const nextState = stateTransformer(getState())
    const returnedValue = executeAction(loggerOptions, next, action)

    const diff =
      loggerOptions.diff && isSome(diffPredicate)
        ? diffPredicate.value(getState, action)
        : loggerOptions.diff

    const logEntry: LogEntry = {
      started: started,
      startedTime: startedTime,
      prevState: prevState,
      action: action,
      took: took,
      nextState: nextState,
      error: returnedValue.error
    }

    logBuffer.push(logEntry)

    printBuffer(logBuffer, Object.assign({}, loggerOptions, { diff }))
    logBuffer.length = 0

    if (logEntry.error) throw logEntry.error
    return returnedValue
  }
}
