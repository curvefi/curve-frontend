import type { ReactNode } from 'react'
import { App } from './client'

// We need to keep this layout here otherwise the whole app gets unmounted on network change
// Because of that we cannot parse the URL params in the server component
const Layout = ({ children }: { children: ReactNode }) => <App>{children}</App>

export default Layout
