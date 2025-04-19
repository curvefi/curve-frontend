import type { Api } from '@/lend/types/lend.types'
import Box from '@ui/Box'
import Button from '@ui/Button'
import { isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

const DetailsConnectWallet = () => {
  const { connectState } = useConnection<Api>()
  const { connect } = useWallet()
  return (
    <Box flex flexJustifyContent="center" padding="var(--spacing-5)">
      <Button variant="filled" loading={isLoading(connectState)} onClick={() => connect()}>
        {isLoading(connectState) ? t`Connecting...` : t`Connect Wallet`}
      </Button>
    </Box>
  )
}

export default DetailsConnectWallet
