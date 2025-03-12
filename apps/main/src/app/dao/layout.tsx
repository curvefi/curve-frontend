import type { ReactNode } from 'react'
import { App } from './client'

const Layout = ({ children }: { children: ReactNode }) => <App>{children}</App>

export default Layout
