import { Diff, diff } from 'deep-diff'
import { DiffKind } from './types'

// https://github.com/flitbit/diff#differences
const dictionary = {
  E: {
    color: '#2196F3',
    text: 'CHANGED:'
  },
  N: {
    color: '#4CAF50',
    text: 'ADDED:'
  },
  D: {
    color: '#F44336',
    text: 'DELETED:'
  },
  A: {
    color: '#2196F3',
    text: 'ARRAY:'
  }
}

export const style: (a: DiffKind) => string = (kind: DiffKind) => {
  return `color: ${dictionary[kind].color}; font-weight: bold`
}

export const renderDiff: <S>(a: Diff<S, S>) => string[] = <S>(diff: Diff<S, S>) => {
  switch (diff.kind) {
    case 'E': {
      const { path, lhs, rhs } = diff
      return (path ? [path.join('.'), lhs, '→', rhs] : []).map(s => String(s))
    }
    case 'N': {
      const { path, rhs } = diff
      return (path ? [path.join('.'), rhs] : []).map(s => String(s))
    }
    case 'D': {
      const { path } = diff
      return (path ? [path.join('.')] : []).map(s => String(s))
    }
    case 'A': {
      const { path, index, item } = diff
      return (path ? [`${path.join('.')}[${index}]`, item] : []).map(s => String(s))
    }
    default:
      return []
  }
}

/// TODO :: This should maybe return a string
export const diffLogger: <S>(a: S, b: S, c: boolean) => void = <S>(
  prevState: S,
  newState: S,
  isCollapsed: boolean
) => {
  const stateDiff = diff(prevState, newState)

  try {
    if (isCollapsed) {
      console.groupCollapsed('diff')
    } else {
      console.group('diff')
    }
  } catch (e) {
    console.log('diff')
  }

  if (stateDiff) {
    stateDiff.forEach(elem => {
      const { kind } = elem
      const output = renderDiff(elem)
      console.log(`%c ${dictionary[kind].text}`, style(kind), ...output)
    })
  } else {
    console.log('—— no diff ——')
  }

  try {
    console.groupEnd()
  } catch (e) {
    console.log('—— diff end —— ')
  }
}
