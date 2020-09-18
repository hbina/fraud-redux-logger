import { AnyAction } from '@reduxjs/toolkit'
import { Option } from 'fp-ts/lib/Option'

export type Transform<B, A> = (a: B) => A
export type Void<T> = () => T
export type LogTime = DateConstructor | Performance
export type LogLevel = 'log' | 'console' | 'warn' | 'error' | 'info'

export type LogEntry<S> = {
  action: AnyAction
  error: Option<any>
  startedTime: Date
  took: number
  prevState: S
  nextState: S
}

export type LoggerOption<S> = {
  level: LogLevel
  logger: Console
  logErrors: boolean
  collapsed: (a: S, b: AnyAction, c: LogEntry<S>) => boolean
  predicate: (a: S, b: AnyAction) => boolean
  duration: boolean
  timestamp: boolean
  stateTransformer: Transform<S, any>
  actionTransformer: Transform<AnyAction, any>
  errorTransformer: Transform<any, any>
  colors: LogColor<S>
  diffPredicate: (a: S, b: AnyAction) => boolean
}

export type LogColor<S> = {
  title: (a: AnyAction) => string
  prevState: (a: S) => string
  action: (a: AnyAction) => string
  nextState: (a: S) => string
  error: (a: any, b: S) => string
}

export enum LogLevelType {
  PREV_STATE = 'PREV_STATE',
  NEXT_STATE = 'NEXT_STATE',
  ACTION = 'ACTION',
  ERROR = 'ERROR',
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
