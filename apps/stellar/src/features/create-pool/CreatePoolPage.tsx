import type { NetworkQuery } from '@/stellar/queries/query-types'
import { CreatePoolForm } from '@ui/features/create-pool/CreatePoolForm'
import { useParams } from '@ui/hooks/router'
import { useCreatePoolForm } from './useCreatePoolForm'

export const CreatePoolPage = () => <CreatePoolForm {...useCreatePoolForm(useParams<NetworkQuery>())} />
