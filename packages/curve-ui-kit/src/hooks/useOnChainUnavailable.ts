export function useOnChainUnavailable(networks: NetworkDef[]) {
  const pathname = usePathname()
  const push = useNavigate()
  return useCallback(
    <TChainId extends number>([walletChainId]: [TChainId, TChainId]) => {
      const network = networks[walletChainId]?.id
      if (pathname && network) {
        console.warn(`Network switched to ${network}, redirecting...`, pathname)
        push(replaceNetworkInPath(pathname, network))
      }
    },
    [networks, pathname, push],
  )
}
