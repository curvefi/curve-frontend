import type { TenderlyAccount } from './types'

/** Implemented as per https://docs.tenderly.co/reference/api#/operations/deleteVnets */
export type DeleteVirtualTestnetsOptions = {
  vnet_ids: string[]
}

export function deleteVirtualTestnets({
  accountSlug,
  projectSlug,
  accessKey,
  ...deleteOptions
}: TenderlyAccount & DeleteVirtualTestnetsOptions) {
  return cy
    .request({
      method: 'DELETE',
      url: `https://api.tenderly.co/api/v1/account/${accountSlug}/project/${projectSlug}/vnets`,
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': accessKey,
      },
      body: deleteOptions,
      failOnStatusCode: false,
    })
    .then((response) => {
      if (!response.isOkStatusCode) {
        throw new Error(
          `Failed to delete virtual testnets '${JSON.stringify(deleteOptions.vnet_ids)}': ${response.status} ${response.statusText}`,
        )
      }
      return response
    })
}
