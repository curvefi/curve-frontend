import type { PoolAlertResult } from '@/dex/hooks/usePoolAlert'
import type { PoolAlert } from '@/dex/types/main.types'
import TooltipAlert from '@ui/Tooltip/TooltipAlert'

export const PoolAlertTooltips = ({
  tokenAlert,
  poolAlert,
}: {
  poolAlert: PoolAlertResult
  tokenAlert: PoolAlert | null
}) => (
  <>
    {(poolAlert?.isInformationOnly || poolAlert?.isInformationOnlyAndShowInForm) && (
      <TooltipAlert minWidth="300px" placement="right-start" {...poolAlert}>
        {poolAlert.message}
      </TooltipAlert>
    )}
    {tokenAlert && (
      <TooltipAlert minWidth="300px" placement="right-start" {...tokenAlert}>
        {tokenAlert.message}
      </TooltipAlert>
    )}
  </>
)
