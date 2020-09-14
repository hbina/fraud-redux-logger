import { Action, AnyAction } from '@reduxjs/toolkit'
import { Option, some, none } from 'fp-ts/lib/Option'

export type ReduxError = any

export type LogTime = DateConstructor | Performance
export type LogLevel = 'info' | 'debug' | 'warning'
export type LogEntry<S> = {
  started: number
  startedTime: Date
  prevState: S
  action: AnyAction
  error: Option<ReduxError>
  took: number
  nextState: S
}

export type LoggerOption<S> = {
  level: LogLevel
  logger: Option<Console>
  logErrors: boolean
  collapsed: Option<(a: () => S, b: AnyAction, c: LogEntry<S>) => boolean>
  predicate: Option<(a: S, b: AnyAction) => boolean>
  duration: false
  timestamp: true
  stateTransformer: (a: S) => S
  actionTransformer: (a: AnyAction) => AnyAction
  errorTransformer: (a: any) => any
  colors: {
    title: () => 'inherit'
    prevState: () => '#9E9E9E'
    action: () => '#03A9F4'
    nextState: () => '#4CAF50'
    error: () => '#F20404'
  }
  diff: false
  diffPredicate: Option<(a: S, b: AnyAction) => boolean>
}

export enum LogLevelType {
  PREV_STATE = 'PREV_STATE',
  NEXT_STATE = 'NEXT_STATE',
  ACTION = 'ACTION',
  ERROR = 'ERROR'
}

export type DiffKind = 'N' | 'D' | 'E' | 'A'
