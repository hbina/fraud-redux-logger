import { Action } from '@reduxjs/toolkit'
import { Option, some, none } from 'fp-ts/lib/Option'

export type ReduxState = any
export type ReduxAction = Action<any>
export type ReduxError = any

export type LogTime = DateConstructor | Performance
export type LogLevel = 'info' | 'debug' | 'warning'
export type LogEntry = {
  started: number
  startedTime: Date
  prevState: ReduxState
  action: ReduxAction
  error: Option<ReduxError>
  took: number
  nextState: ReduxState
}

export type LoggerOption = {
  level: LogLevel
  logger: Option<Console>
  logErrors: boolean
  collapsed: Option<(a: () => ReduxState, b: ReduxAction, c: LogEntry) => boolean>
  predicate: Option<(a: ReduxState, b: ReduxAction) => boolean>
  duration: false
  timestamp: true
  stateTransformer: (a: ReduxState) => ReduxState
  actionTransformer: (a: ReduxAction) => ReduxAction
  errorTransformer: (a: ReduxError) => ReduxError
  colors: {
    title: () => 'inherit'
    prevState: () => '#9E9E9E'
    action: () => '#03A9F4'
    nextState: () => '#4CAF50'
    error: () => '#F20404'
  }
  diff: false
  diffPredicate: Option<(a: ReduxState, b: ReduxAction) => boolean>
}

export enum LogLevelType {
  PREV_STATE = 'PREV_STATE',
  NEXT_STATE = 'NEXT_STATE',
  ACTION = 'ACTION',
  ERROR = 'ERROR'
}

export type DiffKind = 'N' | 'D' | 'E' | 'A'
