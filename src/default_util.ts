import { Diff, diff } from 'deep-diff'

import { DiffKind, DefaultWebLoggerOption, LogLevel } from './types'
import { AnyAction } from '@reduxjs/toolkit'

export const defaultTitleFormatter = <S, E, TS, TA, TE>(
  options: DefaultWebLoggerOption<S, E, TS, TA, TE>
) => {
  const { showTimestamp, showDuration } = options

  return (action: AnyAction, time: string, took: number) => {
    let parts = ['action', `%c ${String(action.type)}`]
    if (showTimestamp) parts.push(`%c @ ${time}`)
    if (showDuration) parts.push(`%c (in ${took.toFixed(2)} ms)`)
    return parts.join(' ')
  }
}

export const printBasedOnLogLevel = <T>(
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

const dictionary = {
  E: {
    color: '#2196F3',
    text: 'CHANGED:',
  },
  N: {
    color: '#4CAF50',
    text: 'ADDED:',
  },
  D: {
    color: '#F44336',
    text: 'DELETED:',
  },
  A: {
    color: '#2196F3',
    text: 'ARRAY:',
  },
}

export const diffStyle: (a: DiffKind) => string = (kind: DiffKind) => {
  return `color: ${dictionary[kind].color}; font-weight: bold`
}

export const renderDiff: <S>(a: Diff<S, S>) => string[] = <S>(diff: Diff<S, S>) => {
  switch (diff.kind) {
    case 'E': {
      const { path, lhs, rhs } = diff
      return (path ? [path.join('.'), lhs, '→', rhs] : []).map((s) => String(s))
    }
    case 'N': {
      const { path, rhs } = diff
      return (path ? [path.join('.'), rhs] : []).map((s) => String(s))
    }
    case 'D': {
      const { path } = diff
      return (path ? [path.join('.')] : []).map((s) => String(s))
    }
    case 'A': {
      const { path, index, item } = diff
      return (path ? [`${path.join('.')}[${index}]`, item] : []).map((s) => String(s))
    }
    default:
      return []
  }
}

/// TODO :: This should maybe return a string
export const diffLogger = <S>(prevState: S, newState: S, logger: Console, isCollapsed: boolean) => {
  const stateDiff = diff(prevState, newState)

  try {
    if (isCollapsed) {
      logger.groupCollapsed('diff')
    } else {
      logger.group('diff')
    }
  } catch (e) {
    logger.log('diff')
  }

  if (stateDiff) {
    stateDiff.forEach((elem) => {
      const { kind } = elem
      const output = renderDiff(elem)
      logger.log(`%c ${dictionary[kind].text}`, diffStyle(kind), ...output)
    })
  } else {
    logger.log('—— no diff ——')
  }

  try {
    logger.groupEnd()
  } catch (e) {
    logger.log('—— diff end —— ')
  }
}
