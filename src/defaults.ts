import { AnyAction } from '@reduxjs/toolkit'
import { LogEntry, LogLevel } from './types'

export const getDefaultOptions = <S, E, TS = S, TA = AnyAction>() => {
  return {
    // Console
    logger: console,
    // Switches
    showError: true,
    showDuration: true,
    showTimestamp: true,
    // Transformers
    stateTransformer: (state: S) => state,
    actionTransformer: (action: AnyAction) => action,
    errorTransformer: (error: E) => error,
    // Predicates
    collapsed: (a: S, b: AnyAction, _c: LogEntry<S, E, TS>) => false,
    predicate: (a: S, b: AnyAction) => true,
    diffPredicate: (a: S, b: AnyAction) => false,
    // Customization
    colors: {
      title: (a: AnyAction) => 'inherit',
      prevState: (a: S) => '#9E9E9E',
      action: (a: AnyAction) => '#03A9F4',
      nextState: (a: S) => '#4CAF50',
      error: (a: E, b: S) => '#F20404',
    },
    // Log level
    logLevel: {
      prevState: (a: TA, b: S) => LogLevel.LOG,
      action: (a: TA) => LogLevel.LOG,
      error: (a: TA, b: E, c: S) => LogLevel.LOG,
      nextState: (a: TA, b: S) => LogLevel.LOG,
    },
  }
}
