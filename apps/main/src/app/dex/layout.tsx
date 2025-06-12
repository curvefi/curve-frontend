import type { ReactNode } from 'react'
import { App } from '@/app/dex/client'
import { getNetworks } from '@/dex/lib/networks'

// We need to keep this layout here otherwise the whole app gets unmounted on network change
// Because of that we cannot parse the URL params in the server component
const Layout = async ({ children }: { children: ReactNode }) => <App networks={await getNetworks()}>{children}</App>

export default Layout
