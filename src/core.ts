import { formatTime } from './helpers'
import { LoggerOption, LogEntry, LogLevel, LogLevelType } from './types'
import { AnyAction } from '@reduxjs/toolkit'
import { diffLogger } from './diff'
import { isSome } from 'fp-ts/lib/Option'

const defaultTitleFormatter = <S, E, TS, TA, TE>(options: LoggerOption<S, E, TS, TA, TE>) => {
  const { showTimestamp, showDuration } = options

  return (action: AnyAction, time: string, took: number) => {
    let parts = ['action', `%c ${String(action.type)}`]
    if (showTimestamp) parts.push(`%c @ ${time}`)
    if (showDuration) parts.push(`%c (in ${took.toFixed(2)} ms)`)
    return parts.join(' ')
  }
}

const printBasedOnLogLevel = <T>(
  logger: Console,
  level: LogLevel,
  message: string,
  style: string,
  content: T
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

export const printLog = <S, E, TS, TA, TE>(
  logEntry: LogEntry<S, E, TS>,
  options: LoggerOption<S, E, TS, TA, TE>,
  shouldLogDiff: boolean
) => {
  // Extraction
  const {
    logger,
    stateTransformer,
    actionTransformer,
    errorTransformer,
    collapsed,
    colors,
    logLevel,
  } = options
  const titleFormatter = defaultTitleFormatter(options)
  const { startedTime, action, prevState, nextState, error, took } = logEntry

  // Transformations
  const transformedPrevState = stateTransformer(prevState)
  const transformedAction = actionTransformer(action)
  const transformedNextState = stateTransformer(nextState)

  // Message
  const isCollapsed = collapsed(nextState, action, logEntry)

  // CSS Formatting
  const formattedTime = formatTime(startedTime)
  const titleCSS = `color: ${colors.title(action)};`
  const headerCSS = ['color: gray; font-weight: lighter;', titleCSS]
  if (options.showTimestamp) headerCSS.push('color: gray; font-weight: lighter;')
  if (options.showDuration) headerCSS.push('color: gray; font-weight: lighter;')
  const title = titleFormatter(action, formattedTime, took)

  // Render
  try {
    if (isCollapsed) {
      logger.groupCollapsed(title)
    } else {
      logger.group(`%c ${title}`, ...headerCSS)
    }
  } catch (e) {
    logger.error(e)
    logger.log(title)
  }

  const prevStateLevel = logLevel.prevState(transformedAction, prevState)
  const actionLevel = logLevel.action(transformedAction)
  const nextStateLevel = logLevel.nextState(transformedAction, nextState)

  {
    const styles = `color: ${colors.prevState(prevState)}; font-weight: bold`
    printBasedOnLogLevel(logger, prevStateLevel, '%c prev state', styles, prevState)
  }

  {
    const styles = `color: ${colors.action(action)}; font-weight: bold`
    printBasedOnLogLevel(logger, actionLevel, '%c action    ', styles, transformedAction)
  }

  {
    if (isSome(error)) {
      const err = error.value
      const transformedError = errorTransformer(err)
      const errorLevel = logLevel.error(transformedAction, err, prevState)
      const styles = `color: ${colors.error(err, prevState)}; font-weight: bold;`
      printBasedOnLogLevel(logger, errorLevel, '%c error     ', styles, transformedError)
    }
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
