import { AnyAction } from '@reduxjs/toolkit'
import { LogEntry, LoggerOption } from './types'

export const getDefaultOptions: <S>() => LoggerOption<S> = <S>() => {
  return {
    level: 'log',
    logger: console,
    logErrors: true,
    collapsed: (_a: S, _b: AnyAction, _c: LogEntry<S>) => false,
    predicate: (a: S, b: AnyAction) => true,
    duration: false,
    timestamp: true,
    stateTransformer: (state: S) => state,
    actionTransformer: (action: AnyAction) => action,
    errorTransformer: (error: any) => error,
    colors: {
      title: () => 'inherit',
      prevState: () => '#9E9E9E',
      action: () => '#03A9F4',
      nextState: () => '#4CAF50',
      error: () => '#F20404',
    },
    diffPredicate: (_a: S, _b: AnyAction) => false,
  }
}
