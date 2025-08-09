import type { TenderlyAccount } from './types'

/** Implemented as per https://docs.tenderly.co/reference/api#/operations/deleteVnets */
export type DeleteVirtualTestnetsOptions = {
  vnet_ids: string[]
}

export async function deleteVirtualTestnets({
  accountSlug,
  projectSlug,
  accessKey,
  ...deleteOptions
}: TenderlyAccount & DeleteVirtualTestnetsOptions) {
  const response = await fetch(`https://api.tenderly.co/api/v1/account/${accountSlug}/project/${projectSlug}/vnets`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Access-Key': accessKey,
    },
    body: JSON.stringify(deleteOptions),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to delete virtual testnets '${JSON.stringify(deleteOptions.vnet_ids)}': ${response.status} ${response.statusText}`,
    )
  }

  return response
}
