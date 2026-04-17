import { useTryNewLlamalend } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'

export const TryNewLlamalendBanner = ({ isActive }: { isActive: boolean }) => {
  const [, setIsActive] = useTryNewLlamalend()
  return (
    <Banner
      severity="info"
      onClick={() => setIsActive((prev) => !prev)}
      icon="llama"
      buttonText={isActive ? t`Go Back` : t`OK`}
    >
      {isActive ? t`Trying the new Llamalend forms` : t`Try the new llamalend forms`}
    </Banner>
  )
}
