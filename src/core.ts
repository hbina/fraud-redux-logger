import { formatTime } from './helpers'
import { LoggerOption, LogEntry, LogLevel } from './types'
import { AnyAction } from '@reduxjs/toolkit'

// TODO :: Figure out what the hell this is...
const getLogLevel: (a: any, b: any, c: any, d: any) => LogLevel = (
  level: any,
  action: any,
  payload: any,
  type: any
) => {
  switch (typeof level) {
    case 'object':
      return typeof level[type] === 'function' ? level[type](...payload) : level[type]
    case 'function':
      return level(action)
    default:
      return level
  }
}

const defaultTitleFormatter: <S>(
  a: LoggerOption<S>
) => (a: AnyAction, b: string, c: number) => string = <S>(options: LoggerOption<S>) => {
  const { timestamp, duration } = options

  return (action: AnyAction, time: string, took: number) => {
    let parts = ['action']

    parts.push(`%c${String(action.type)}`)
    if (timestamp) parts.push(`%c@ ${time}`)
    if (duration) parts.push(`%c(in ${took.toFixed(2)} ms)`)

    return parts.join(' ')
  }
}

const printBasedOnLogLevel = (
  console: Console,
  level: LogLevel,
  message: string,
  style: string,
  content: any
) => {
  switch (level) {
    case 'error': {
      console.error(message, style, content)
    }
    case 'info': {
      console.info(message, style, content)
    }
    case 'log': {
      console.log(message, style, content)
    }
    case 'warn': {
      console.warn(message, style, content)
    }
  }
}

export const printLog: <S>(a: LogEntry<S>, b: LoggerOption<S>, c: boolean) => void = <S>(
  logEntry: LogEntry<S>,
  options: LoggerOption<S>,
  shouldLogDiff: boolean
) => {
  // Extraction
  const { logger, actionTransformer, collapsed, colors, level } = options
  const titleFormatter = defaultTitleFormatter(options)
  const { startedTime, action, prevState, nextState, error, took } = logEntry

  const isUsingDefaultFormatter = false

  // Message
  const formattedAction = actionTransformer(action)
  const isCollapsed = options.collapsed(nextState, action, logEntry)

  // CSS Formatting
  const formattedTime = formatTime(startedTime)
  const titleCSS = `color: ${colors.title(action)};`
  const headerCSS = ['color: gray; font-weight: lighter;', titleCSS]
  if (options.timestamp) headerCSS.push('color: gray; font-weight: lighter;')
  if (options.duration) headerCSS.push('color: gray; font-weight: lighter;')
  const title = titleFormatter(formattedAction, formattedTime, took)

  // Render
  try {
    if (isCollapsed) {
      if (isUsingDefaultFormatter) {
        logger.groupCollapsed(`%c ${title}`, ...headerCSS)
      } else logger.groupCollapsed(title)
    } else if (isUsingDefaultFormatter) {
      logger.group(`%c ${title}`, ...headerCSS)
    } else {
      logger.group(title)
    }
  } catch (e) {
    logger.log(title)
  }

  const prevStateLevel = getLogLevel(level, formattedAction, [prevState], 'prevState')
  const actionLevel = getLogLevel(level, formattedAction, [formattedAction], 'action')
  const errorLevel = getLogLevel(level, formattedAction, [error, prevState], 'error')
  const nextStateLevel = getLogLevel(level, formattedAction, [nextState], 'nextState')

  {
    const styles = `color: ${colors.prevState(prevState)}; font-weight: bold`
    printBasedOnLogLevel(logger, prevStateLevel, '%c prev state', styles, prevState)
  }

  {
    const styles = `color: ${colors.action(formattedAction)}; font-weight: bold`
    printBasedOnLogLevel(logger, actionLevel, '%c action    ', styles, formattedAction)
  }

  {
    const styles = `color: ${colors.error(error, prevState)}; font-weight: bold;`
    printBasedOnLogLevel(logger, errorLevel, '%c error     ', styles, error)
  }

  {
    const styles = `color: ${colors.nextState(nextState)}; font-weight: bold`
    printBasedOnLogLevel(logger, errorLevel, '%c next state', styles, nextState)
  }
}
