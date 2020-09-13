import { none, some } from 'fp-ts/lib/Option'
import { LoggerOption } from './types'

export const defaultOptions: LoggerOption = {
  level: 'info',
  logger: some(console),
  logErrors: true,
  collapsed: none,
  predicate: none,
  duration: false,
  timestamp: true,
  stateTransformer: state => state,
  actionTransformer: action => action,
  errorTransformer: error => error,
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

export default defaultOptions
