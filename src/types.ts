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

export type LogEntry<S, E> = {
  readonly action: AnyAction
  readonly error: Option<E>
  readonly startedTime: Date
  readonly took: number
  readonly prevState: S
  readonly nextState: S
}

export type LoggerOption<S, E, TS, TA, TE> = {
  // User console
  readonly logger: Console
  // Switches
  readonly showError: boolean
  readonly showDuration: boolean
  readonly showTimestamp: boolean
  // Transformers
  readonly stateTransformer: Transform<S, TS>
  readonly actionTransformer: Transform<AnyAction, TA>
  readonly errorTransformer: Transform<E, TE>
  // Predicates
  readonly collapsePredicate: (a: S, b: AnyAction, c: LogEntry<S, E>) => boolean
  readonly logPredicate: (a: S, b: AnyAction) => boolean
  readonly diffPredicate: (a: S, b: AnyAction) => boolean
  // Customization
  readonly colors: LogColor<S, E>
  // Log levels
  readonly logLevel: {
    readonly prevState: (a: TA, b: S) => LogLevel
    readonly action: (a: TA) => LogLevel
    readonly error: (a: TA, b: E, c: S) => LogLevel
    readonly nextState: (a: TA, b: S) => LogLevel
  }
}

export type LogColor<S, E> = {
  readonly title: (a: AnyAction) => string
  readonly prevState: (a: S) => string
  readonly action: (a: AnyAction) => string
  readonly nextState: (a: S) => string
  readonly error: (a: E, b: S) => string
}

export enum LogLevelType {
  PREV_STATE = 'PREV_STATE',
  NEXT_STATE = 'NEXT_STATE',
  ACTION = 'ACTION',
  ERROR = 'ERROR',
}

export type DiffKind = 'N' | 'D' | 'E' | 'A'

export type LogSwapchain = {
  readonly before: Option<number>
  readonly after: Option<number>
}

export type ExecuteActionResult = {
  readonly result: AnyAction
  readonly error: Option<any>
}
