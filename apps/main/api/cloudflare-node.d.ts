declare module 'cloudflare:node' {
  import type { Server } from 'node:http'

  export const httpServerHandler: (server: Server) => { fetch(request: Request): Promise<Response> }
}
