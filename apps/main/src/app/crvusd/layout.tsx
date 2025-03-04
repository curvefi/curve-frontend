import { App } from './client'
import type { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => <App>{children}</App>

export default Layout
