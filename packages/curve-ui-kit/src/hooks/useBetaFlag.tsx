import { isBetaDefault } from '../utils'
import { useLocalStorage } from './useLocalStorage'

export const useBetaFlag = () => useLocalStorage<boolean>('beta', isBetaDefault)
