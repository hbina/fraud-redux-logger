import { AnyAction } from '@reduxjs/toolkit'
import { LogEntry, LogLevel } from './types'

export const getDefaultOptions = <S, TS = any, A = any, TA = any, E = any, TE = any>() => {
  return {
    logLevel: {
      prevState: (_a: TA, b: S) => LogLevel.LOG,
      action: (_a: TA) => LogLevel.LOG,
      error: (_a: TA, b: E, c: S) => LogLevel.LOG,
      nextState: (a: TA, b: S) => LogLevel.LOG,
    },
    logger: console,
    logErrors: true,
    collapsed: (_a: S, _b: A, _c: LogEntry<S>) => false,
    predicate: (a: S, b: A) => true,
    duration: false,
    timestamp: true,
    stateTransformer: (state: S) => state,
    actionTransformer: (action: A) => action,
    errorTransformer: (error: any) => error,
    colors: {
      title: () => 'inherit',
      prevState: () => '#9E9E9E',
      action: () => '#03A9F4',
      nextState: () => '#4CAF50',
      error: () => '#F20404',
    },
    diffPredicate: (_a: S, _b: A) => false,
  }
}
