import { AnyAction } from '@reduxjs/toolkit'
import { none, some } from 'fp-ts/lib/Option'
import { LoggerOption } from './types'

export const getDefaultOptions: <S>() => LoggerOption<S> = <S>() => {
  return {
    level: 'info',
    logger: some(console),
    logErrors: true,
    collapsed: none,
    predicate: none,
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
      error: () => '#F20404'
    },
    diff: false,
    diffPredicate: none
  }
}
