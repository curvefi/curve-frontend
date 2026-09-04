import { t } from '@evm-ui/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type TxGasInfo } from '@evm-ui/shared/ui/ActionInfo'
import { formatNumber } from '@evm-ui/utils'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'

export const VeCrvActionInfo = ({
  currentVeCrv,
  futureVeCrv,
  gas,
  isApproved,
  isOpen,
}: {
  currentVeCrv?: QueryProp<Decimal>
  futureVeCrv?: QueryProp<Decimal>
  gas: QueryProp<TxGasInfo | null>
  isApproved?: boolean
  isOpen: boolean
}) => (
  <Collapse in={isOpen}>
    <Stack>
      {(currentVeCrv ?? futureVeCrv) && (
        <ActionInfo
          label={t`veCRV`}
          value={currentVeCrv && mapQuery(currentVeCrv, data => formatNumber(data, 'token.amount'))}
          futureValue={futureVeCrv && mapQuery(futureVeCrv, data => formatNumber(data, 'token.amount'))}
          size="small"
          testId="future-vecrv"
        />
      )}
      <ActionInfoGasEstimate gas={gas} isApproved={isApproved} />
    </Stack>
  </Collapse>
)
