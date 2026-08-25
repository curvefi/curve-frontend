import { useSwitch } from '@evm-ui/hooks/useSwitch'

export const useTransitionTestId = (testId: string) => {
  const [isReady, setReady, resetReady] = useSwitch()
  return {
    transition: { onEntered: setReady, onExited: resetReady },
    props: isReady && ({ 'data-testid': testId } as const),
  } as const
}
