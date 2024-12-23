import { FieldsOf } from '@ui-kit/lib/validation'
import { ChainQuery } from '@ui-kit/lib/model/query'

export type TokenQuery = ChainQuery & { tokenAddress: string }
export type TokenParams = FieldsOf<TokenQuery>
