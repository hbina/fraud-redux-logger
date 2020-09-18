import { Diff, diff } from 'deep-diff'
import { DiffKind } from './types'

// https://github.com/flitbit/diff#differences
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
