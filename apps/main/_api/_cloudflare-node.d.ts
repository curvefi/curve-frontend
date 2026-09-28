/** This file defines the cloudflare node adapter type. It is prefixed with _ so it's ignored by Vercel. */
declare module 'cloudflare:node' {
  import type { Server } from 'node:http'

  export const httpServerHandler: (server: Server) => { fetch(request: Request): Promise<Response> }
}
