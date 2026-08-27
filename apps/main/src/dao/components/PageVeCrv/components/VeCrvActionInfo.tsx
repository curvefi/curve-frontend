import { ActionInfoGasEstimate, type TxGasInfo } from '@evm-ui/shared/ui/ActionInfo'
import type { QueryProp } from '@evm-ui/types/util'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'

export const VeCrvActionInfo = ({
  gas,
  isApproved,
  isOpen,
}: {
  gas: QueryProp<TxGasInfo | null>
  isApproved?: boolean
  isOpen: boolean
}) => (
  <Collapse in={isOpen}>
    <Stack>
      <ActionInfoGasEstimate gas={gas} isApproved={isApproved} />
    </Stack>
  </Collapse>
)
