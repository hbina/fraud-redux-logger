import { formatTime } from './helpers'
import { LoggerOption, LogEntry } from './types'
import { isSome } from 'fp-ts/lib/Option'
import { AnyAction } from '@reduxjs/toolkit'

function defaultTitleFormatter<S>(options: LoggerOption<S>) {
  const { timestamp, duration } = options

  return (action: AnyAction, time: string, took: number) => {
    let parts = ['action']

    parts.push(`%c${String(action.type)}`)
    if (timestamp) parts.push(`%c@ ${time}`)
    if (duration) parts.push(`%c(in ${took.toFixed(2)} ms)`)

    return parts.join(' ')
  }
}

function printLog<S>(logEntry: LogEntry<S>, options: LoggerOption<S>) {
  const { logger, actionTransformer, collapsed, colors, level, diff } = options
  const titleFormatter = defaultTitleFormatter(options)
  const { startedTime, action, prevState, error, took } = logEntry

  // CSS Formatting
  const formattedAction = actionTransformer(action)
  const formattedTime = formatTime(startedTime)
  const titleCSS = colors.title ? `color: ${colors.title()};` : ''
  const headerCSS = ['color: gray; font-weight: lighter;']
  headerCSS.push(titleCSS)
  if (options.timestamp) headerCSS.push('color: gray; font-weight: lighter;')
  if (options.duration) headerCSS.push('color: gray; font-weight: lighter;')
  const title = titleFormatter(formattedAction, formattedTime, took)

  // Begin printing
  if (isSome(logger)) {
    logger.value.log('hello world')
  }
}

export default printLog
