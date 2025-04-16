'use client'
import { usePageOnMount } from '@/dao/hooks/usePageOnMount'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import type { DisclaimerProps } from '@ui-kit/widgets/Disclaimer/Disclaimer'

export const DaoDisclaimerPage = (props: DisclaimerProps) => {
  usePageOnMount() // required for wallet connection
  return <Disclaimer {...props} />
}
