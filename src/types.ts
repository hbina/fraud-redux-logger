import { Action, AnyAction } from '@reduxjs/toolkit'
import { Option, some, none } from 'fp-ts/lib/Option'

export type ReduxError = any
export type Identity<T> = (a: T) => T
export type Void<T> = () => T
export type LogTime = DateConstructor | Performance
export type LogLevel = 'info' | 'debug' | 'warning'
export type LogEntry<S> = {
  action: AnyAction
  error: Option<ReduxError>
  startedTime: Date
  took: number
  prevState: S
  nextState: S
}

export type LoggerOption<S> = {
  level: LogLevel
  logger: Option<Console>
  logErrors: boolean
  collapsed: Option<(a: Void<S>, b: AnyAction, c: LogEntry<S>) => boolean>
  predicate: Option<(a: S, b: AnyAction) => boolean>
  duration: boolean
  timestamp: boolean
  stateTransformer: Identity<S>
  actionTransformer: Identity<AnyAction>
  errorTransformer: Identity<ReduxError>
  colors: LogColor
  diff: boolean
  diffPredicate: Option<(a: S, b: AnyAction) => boolean>
}

export type LogColor = {
  title: Void<string>
  prevState: Void<string>
  action: Void<string>
  nextState: Void<string>
  error: Void<string>
}

export enum LogLevelType {
  PREV_STATE = 'PREV_STATE',
  NEXT_STATE = 'NEXT_STATE',
  ACTION = 'ACTION',
  ERROR = 'ERROR'
}

export type DiffKind = 'N' | 'D' | 'E' | 'A'

export type LogSwapchain = {
  before: Option<number>
  after: Option<number>
}

export type ExecuteActionResult = {
  result: AnyAction
  error: Option<any>
}
