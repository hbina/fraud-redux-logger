import { formatTime } from './helpers'
import { LoggerOption, LogEntry, LogLevel, LogLevelType } from './types'
import { AnyAction } from '@reduxjs/toolkit'
import { diffLogger } from './diff'

const defaultTitleFormatter = <S>(options: LoggerOption<S>) => {
  const { timestamp, duration } = options

  return (action: AnyAction, time: string, took: number) => {
    let parts = ['action', `%c ${String(action.type)}`]
    if (timestamp) parts.push(`%c @ ${time}`)
    if (duration) parts.push(`%c (in ${took.toFixed(2)} ms)`)
    return parts.join(' ')
  }
}

const printBasedOnLogLevel = (
  logger: Console,
  level: LogLevel,
  message: string,
  style: string,
  content: any
) => {
  switch (level) {
    case LogLevel.ERROR: {
      logger.error(message, style, content)
      break
    }
    case LogLevel.INFO: {
      logger.info(message, style, content)
      break
    }
    case LogLevel.LOG: {
      logger.log(message, style, content)
      break
    }
    case LogLevel.WARN: {
      logger.warn(message, style, content)
      break
    }
  }
}

export const printLog = <S>(
  logEntry: LogEntry<S>,
  options: LoggerOption<S>,
  shouldLogDiff: boolean
) => {
  // Extraction
  const { logger, actionTransformer, collapsed, colors, logLevel } = options
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

  const prevStateLevel = logLevel.prevState(formattedAction, prevState)
  const actionLevel = logLevel.action(formattedAction)
  const errorLevel = logLevel.error(formattedAction, error, prevState)
  const nextStateLevel = logLevel.nextState(formattedAction, nextState)

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
    printBasedOnLogLevel(logger, nextStateLevel, '%c next state', styles, nextState)
  }

  // NOTE :: No idea where the original redux-logger gets this?
  // if (logger.withTrace) {
  //   logger.groupCollapsed('TRACE')
  //  logger.trace()
  //  logger.groupEnd()
  // }

  if (shouldLogDiff) {
    diffLogger(prevState, nextState, logger, isCollapsed)
  }

  try {
    logger.groupEnd()
  } catch (e) {
    logger.log('—— log end ——')
  }
}
