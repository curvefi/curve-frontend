import type { Metadata } from 'next'
import CreatePool from '@/dex/components/PageCreatePool/Page'

export const metadata: Metadata = { title: 'Curve - Create Pool' } // todo: get rid of one metadata

const CreatePoolPage = async () => <CreatePool />

export default CreatePoolPage
