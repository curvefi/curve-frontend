import { createValidationSuite } from '@ui-kit/lib/validation'
import { enforce, group, test } from 'vest'
import useStore from '@/loan/store/useStore'
import type { ChainId } from '@/loan/types/loan.types'

export const curvejsValidationGroup = ({ chainId }: { chainId: ChainId | null }) =>
  group('apiValidation', () => {
    test('api', () => {
      const curve = useStore.getState().curve
      enforce(curve?.chainId).message('Chain ID should be loaded').equals(chainId)
    })
  })

export const chainValidationSuite = createValidationSuite(curvejsValidationGroup)
