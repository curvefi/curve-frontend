import { useCallback, useMemo, useState } from 'react'
import { BaseError } from 'viem/errors/base'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import MenuList from '@mui/material/MenuList'
import { styled } from '@mui/material/styles'
import { useWagmi } from '@ui-kit/features/connect-wallet/lib/wagmi/useWagmi'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import { WalletIcon } from '@ui-kit/shared/icons/WalletIcon'
import { MenuItem } from '@ui-kit/shared/ui/MenuItem'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { supportedWallets, type WalletType } from '../lib/wagmi/wallets'

const { IconSize } = SizesAndSpaces

const IconImg = styled('img')({
  ...handleBreakpoints({
    width: IconSize.lg,
    height: IconSize.lg,
  }),
  alt: '',
})

/**
 * Menu item for each wallet type. Only needed so we can useCallback
 */
const WalletListItem = ({
  onConnect: connect,
  wallet,
  isLoading,
  isDisabled,
}: {
  wallet: WalletType
  onConnect: (wallet: WalletType) => Promise<void>
  isLoading?: boolean
  isDisabled?: boolean
}) => {
  const { label, icon: Icon } = wallet
  const onConnect = useCallback(() => connect(wallet), [connect, wallet])
  const icon = typeof Icon === 'string' ? <IconImg src={Icon} /> : <Icon />
  return (
    <MenuItem
      key={label}
      label={label}
      icon={icon}
      value={label}
      onSelected={onConnect}
      isLoading={isLoading}
      disabled={isDisabled && !isLoading}
    />
  )
}

const SHOW_MORE_LIMIT = 6

function useWalletList({
  isConnectingLabel,
  onConnect,
}: {
  isConnectingLabel: string | null
  onConnect: (wallet: WalletType) => Promise<void>
}) {
  const extraProviders: Eip6963Provider[] | undefined = window.ethereum?.eip6963ProviderDetails
  return useMemo(() => {
    const isConnecting = !!isConnectingLabel
    const allWallets = [
      // show all providers from the window object
      ...(extraProviders ?? []).map(
        ({ info }): WalletType => ({
          label: info.name,
          icon: info.icon,
          connector: 'injected',
        }),
      ),
      // hide providers that are already in the list
      ...supportedWallets.filter(
        ({ label }) => !extraProviders?.some(({ info }) => label.toLowerCase().includes(info.name.toLowerCase())),
      ),
    ].map((wallet) => ({
      wallet: wallet,
      onConnect: onConnect,
      key: wallet.label,
      isLoading: isConnectingLabel == wallet.label,
      isDisabled: isConnecting,
    }))
    return [allWallets.slice(0, SHOW_MORE_LIMIT), allWallets.slice(SHOW_MORE_LIMIT)]
  }, [extraProviders, isConnectingLabel, onConnect])
}

/**
 * Display a list of wallets to choose from, connecting to the selected one.
 * Use global state retrieved from the useWagmi hook to determine if the modal is open.
 */
export const WagmiConnectModal = () => {
  const [{ showModal }, connect, , closeModal] = useWagmi()
  const [error, setError] = useState<unknown>(null)
  const [isConnectingLabel, setIsConnectingLabel] = useState<string | null>(null)
  const [isShowingAll, showMoreWallets, hideExtraWallets] = useSwitch(false)

  const onConnect = useCallback(
    async ({ label }: WalletType) => {
      setError(null)
      try {
        setIsConnectingLabel(label)
        await connect(label)
        closeModal()
      } catch (e) {
        console.info(e) // e.g. user rejected
        setError(e)
      } finally {
        setIsConnectingLabel(null)
      }
    },
    [connect, closeModal],
  )

  const [shownWallets, extraWallets] = useWalletList({ isConnectingLabel, onConnect })

  return (
    <ModalDialog
      open={showModal}
      onClose={closeModal}
      title={t`Connect Wallet`}
      titleAction={<WalletIcon />}
      onTransitionExited={hideExtraWallets}
      compact
    >
      {error ? (
        <Alert variant="filled" severity="error">
          <AlertTitle>{t`Error connecting wallet`}</AlertTitle>
          {(error as BaseError).shortMessage ?? (error as Error).message ?? (error as string)}
        </Alert>
      ) : null}
      <MenuList>
        {shownWallets.map(({ key, ...props }) => (
          <WalletListItem key={key} {...props} />
        ))}
        {extraWallets && (
          <Collapse in={isShowingAll}>
            {extraWallets.map(({ key, ...props }) => (
              <WalletListItem key={key} {...props} />
            ))}
          </Collapse>
        )}
      </MenuList>
      {!isShowingAll && (
        <Button color="ghost" endIcon={<ArrowDownIcon />} onClick={showMoreWallets} size="extraSmall">
          {t`Show more wallets`}
        </Button>
      )}
    </ModalDialog>
  )
}
