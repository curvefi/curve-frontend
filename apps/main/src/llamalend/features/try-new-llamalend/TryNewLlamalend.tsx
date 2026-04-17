import { useReleaseChannel, useTryNewLlamalend } from '@ui-kit/hooks/useLocalStorage'
import { ReleaseChannel } from '@ui-kit/utils'
import { TryNewLlamalendBanner } from './TryNewLlamalendBanner'
import { TryNewLlamalendModal } from './TryNewLlamalendModal'

export const TryNewLlamalend = () => {
  const [isActive] = useTryNewLlamalend()
  const [releaseChannel] = useReleaseChannel()
  return releaseChannel === ReleaseChannel.Stable ? (
    isActive == null ? (
      <TryNewLlamalendModal />
    ) : (
      <TryNewLlamalendBanner isActive={isActive} />
    )
  ) : null
}
