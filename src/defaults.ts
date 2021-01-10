import { AnyAction } from '@reduxjs/toolkit'
import { isSome } from 'fp-ts/lib/Option'
import { defaultTitleFormatter, printBasedOnLogLevel, diffLogger } from './default_util'
import { formatTime } from './helpers'
import { LogEntry, DefaultWebLoggerOption, LogLevel, Printer } from './types'

export const getDefaultWebPrinter: <S, E>() => Printer<S, E, DefaultWebLoggerOption<S, E>> = <
  S,
  E
>() => {
  return {
    logError: true,
    logPredicate: (_s: S, _b: AnyAction) => true,
    printLog: (logEntry: LogEntry<S, E>, options: DefaultWebLoggerOption<S, E>) => {
      // Extraction
      const {
        logger,
        showError,
        stateTransformer,
        actionTransformer,
        errorTransformer,
        collapsePredicate,
        diffPredicate,
        colors,
        logLevel,
      } = options
      const titleFormatter = defaultTitleFormatter(options)
      const { action, error, startedTime, took, prevState, nextState } = logEntry

      // Transformations
      const transformedPrevState = stateTransformer(prevState)
      const transformedAction = actionTransformer(action)
      const transformedNextState = stateTransformer(nextState)

      // Message
      const isCollapsed = collapsePredicate(nextState, action, logEntry)

      // CSS Formatting
      const formattedTime = formatTime(startedTime)
      const titleCSS = `color: ${colors.title(action)};`
      const headerCSS = ['color: gray; font-weight: lighter;', titleCSS]
      if (options.showTimestamp) headerCSS.push('color: gray; font-weight: lighter;')
      if (options.showDuration) headerCSS.push('color: gray; font-weight: lighter;')
      const title = titleFormatter(action, formattedTime, took)

      // Render
      // Note :: How does this throws exception?
      try {
        if (isCollapsed) {
          logger.groupCollapsed(title)
        } else {
          logger.group(`%c ${title}`, ...headerCSS)
        }
      } catch (e) {
        logger.error(e)
      }

      const prevStateLevel = logLevel.prevState(transformedAction, prevState)
      const actionLevel = logLevel.action(transformedAction)
      const nextStateLevel = logLevel.nextState(transformedAction, nextState)

      {
        const styles = `color: ${colors.prevState(prevState)}; font-weight: bold`
        printBasedOnLogLevel(logger, prevStateLevel, '%c prev state', styles, transformedPrevState)
      }

      {
        const styles = `color: ${colors.action(action)}; font-weight: bold`
        printBasedOnLogLevel(logger, actionLevel, '%c action    ', styles, transformedAction)
      }

      {
        if (isSome(error) && showError) {
          const err = error.value
          const transformedError = errorTransformer(err)
          const errorLevel = logLevel.error(transformedAction, err, prevState)
          const styles = `color: ${colors.error(err, prevState)}; font-weight: bold;`
          printBasedOnLogLevel(logger, errorLevel, '%c error     ', styles, transformedError)
        }
      }

      {
        const styles = `color: ${colors.nextState(nextState)}; font-weight: bold`
        printBasedOnLogLevel(logger, nextStateLevel, '%c next state', styles, transformedNextState)
      }

      // NOTE :: No idea where the original redux-logger gets this?
      // if (logger.withTrace) {
      //   logger.groupCollapsed('TRACE')
      //  logger.trace()
      //  logger.groupEnd()
      // }

      if (diffPredicate(nextState, action)) {
        diffLogger(prevState, nextState, logger, isCollapsed)
      }

      try {
        logger.groupEnd()
      } catch (e) {
        logger.log('—— log end ——')
      }
    },
  }
}

export const getDefaultOptions = <S, E>() => {
  return {
    // Console
    logger: console,
    // Switches
    showError: true,
    showDuration: true,
    showTimestamp: true,
    // Transformers
    stateTransformer: (state: S) => state,
    actionTransformer: (action: AnyAction) => action,
    errorTransformer: (error: E) => error,
    // Predicates
    collapsePredicate: (_a: S, _b: AnyAction, _c: LogEntry<S, E>) => true,
    logPredicate: (_a: S, _b: AnyAction) => true,
    diffPredicate: (_a: S, _b: AnyAction) => true,
    // Customization
    colors: {
      title: (_a: AnyAction) => 'inherit',
      prevState: (_a: S) => '#9E9E9E',
      action: (_a: AnyAction) => '#03A9F4',
      nextState: (_a: S) => '#4CAF50',
      error: (_a: E, _b: S) => '#F20404',
    },
    // Log level
    logLevel: {
      prevState: (_a: AnyAction, _b: S) => LogLevel.LOG,
      action: (_a: AnyAction) => LogLevel.LOG,
      error: (_a: AnyAction, _b: E, _c: S) => LogLevel.LOG,
      nextState: (_a: AnyAction, _b: S) => LogLevel.LOG,
    },
  }
}
