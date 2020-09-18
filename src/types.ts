import { AnyAction } from '@reduxjs/toolkit'
import { Option } from 'fp-ts/lib/Option'

export type Transform<A, B> = (a: A) => B
export type Void<T> = () => T
export type LogTime = DateConstructor | Performance
export enum LogLevel {
  LOG = 'LOG',
  WARN = 'WARN',
  ERROR = 'ERROR',
  INFO = 'INFO',
}

export type LogEntry<S> = {
  action: AnyAction
  error: Option<any>
  startedTime: Date
  took: number
  prevState: S
  nextState: S
}

export type LoggerOption<S, TS = any, A = any, TA = any, E = any, TE = any> = {
  // User console
  logger: Console
  // Switches
  logErrors: boolean
  duration: boolean
  timestamp: boolean
  // Transformers
  stateTransformer: Transform<S, TS>
  actionTransformer: Transform<A, TA>
  errorTransformer: Transform<E, TE>
  // Predicates
  collapsed: (a: S, b: A, c: LogEntry<S>) => boolean
  predicate: (a: S, b: A) => boolean
  diffPredicate: (a: S, b: A) => boolean
  // Customization
  colors: LogColor<S>
  // Log levels
  logLevel: {
    prevState: (a: TA, b: S) => LogLevel
    action: (a: TA) => LogLevel
    error: (a: TA, b: E, c: S) => LogLevel
    nextState: (a: TA, b: S) => LogLevel
  }
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
