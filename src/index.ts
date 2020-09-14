import printBuffer from './core'
import { timer } from './helpers'
import defaults, { getDefaultOptions } from './defaults'
import { LogEntry, LoggerOption, ReduxError } from './types'
import { time } from 'console'
import { isSome, some, none, Option, isNone } from 'fp-ts/lib/Option'
import { Either, left, right } from 'fp-ts/lib/Either'
import { MiddlewareFunction, reduxMiddlewareFactory } from 'redux-middleware-factory'
import { Action, AnyAction, Dispatch, MiddlewareAPI } from '@reduxjs/toolkit'
import { diff } from 'deep-diff'
import { renderDiff } from './diff'

type ExecuteActionResult<BA, NA> = {
  result: BA | NA
  error: Option<any>
}

const executeAction: <S, BA, NA>(
  a: LoggerOption<S>,
  next: (a: BA) => NA,
  action: BA
) => ExecuteActionResult<BA, NA> = <S, BA, NA>(
  option: LoggerOption<S>,
  next: (a: BA) => NA,
  action: BA
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

const createLogger: <S>(options: LoggerOption<S>) => MiddlewareFunction<S> = <S>(
  options: LoggerOption<S>
) => {
  return reduxMiddlewareFactory(
    <S, D extends Dispatch<AnyAction>>(store: MiddlewareAPI<D, S>, next: D, action: AnyAction) => {
      /// NOTE :: The actual loggig logic :)
      console.log(`executing action ${JSON.stringify(action)}`)
      const beforeState = store.getState()
      console.log(`before state:${JSON.stringify(beforeState)}`)
      const result = executeAction(options, next, action)
      const afterState = store.getState()
      console.log(`after state:${JSON.stringify(afterState)}`)
      console.log(`result:${JSON.stringify(result)}`)
      diff(beforeState, afterState)?.forEach(diff => {
        if (diff) {
          console.log(`diff:${JSON.stringify(renderDiff(diff))}`)
        }
      })
      return result.result
    }
  )
}

export const defaultLogger = <S>(store: MiddlewareAPI<Dispatch<AnyAction>, S>) => {
  return createLogger(getDefaultOptions<S>())(store)
}
