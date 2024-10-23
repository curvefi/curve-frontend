import { FieldsOf } from '@/shared/lib/validation'
import { ChainQuery } from '@/shared/model/query'

export type TokenQuery = ChainQuery & { tokenAddress: string };
export type TokenParams = FieldsOf<TokenQuery>;
