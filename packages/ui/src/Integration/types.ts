export type IntegrationTag = { id: string; displayName: string; color: string }

export type IntegrationsTags = {
  [k: string]: IntegrationTag
}

export type IntegrationApp = {
  appUrl: string | null
  description: string
  imageId: string | null
  name: string
  networks: { [network: string]: boolean }
  tags: { [tag: string]: boolean }
  twitterUrl: string | null
}
