import { createRoot } from 'react-dom/client'
import { StellarApp } from '@/stellar/App'
import { initSentry } from '@ui/features/sentry'

initSentry('curve-stellar')

createRoot(document.getElementById('root')!).render(<StellarApp />)
