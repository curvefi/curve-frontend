import { createVercelHandler } from '@api-server/vercel'
import { createRouterApiServer } from '@router-api/server'

export default createVercelHandler(createRouterApiServer())
