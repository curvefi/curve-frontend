import { t } from '@evm-ui/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type TxGasInfo } from '@evm-ui/shared/ui/ActionInfo'
import { constQ, mapQuery, type QueryProp } from '@evm-ui/types/util'
import { amount, formatNumber } from '@evm-ui/utils'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'

export const VeCrvActionInfo = ({
  currentVeCrv,
  futureVeCrv,
  gas,
  isApproved,
  isOpen,
}: {
  currentVeCrv?: QueryProp<Decimal | number | null | undefined>
  futureVeCrv?: QueryProp<number | null | undefined>
  gas: QueryProp<TxGasInfo | null>
  isApproved?: boolean
  isOpen: boolean
}) => (
  <Collapse in={isOpen}>
    <Stack>
      {(currentVeCrv ?? futureVeCrv) && (
        <ActionInfo
          label={t`veCRV`}
          value={mapQuery(currentVeCrv ?? constQ(undefined), data =>
            maybe(data, data => formatNumber(amount(data), 'token.amount')),
          )}
          futureValue={mapQuery(futureVeCrv ?? constQ(undefined), data =>
            maybe(data, data => formatNumber(data, 'token.amount')),
          )}
          size="small"
          testId="future-vecrv"
        />
      )}
      <ActionInfoGasEstimate gas={gas} isApproved={isApproved} />
    </Stack>
  </Collapse>
)
