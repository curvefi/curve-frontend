import type { TenderlyAccount } from './account'

/** Implemented as per https://docs.tenderly.co/reference/api#/operations/deleteVnets */
export type DeleteVirtualTestnetOptions = {
  /**
   * Virtual TestNet ID obtained in creation (not the RPC link key)
   * @example 50115ccc-c9ee-452d-986b-56af1b417b3f
   * */
  vnetId: string
}

export function deleteVirtualTestnet({
  accountSlug,
  projectSlug,
  accessKey,
  vnetId,
}: TenderlyAccount & DeleteVirtualTestnetOptions) {
  return cy
    .request({
      method: 'DELETE',
      url: `https://api.tenderly.co/api/v1/account/${accountSlug}/project/${projectSlug}/vnets/${vnetId}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': accessKey,
      },
      failOnStatusCode: false,
    })
    .then((response) => {
      if (!response.isOkStatusCode) {
        throw new Error(
          `Failed to delete virtual testnet '${JSON.stringify(vnetId)}': ${response.status} ${response.statusText}`,
        )
      }
      return response
    })
}
