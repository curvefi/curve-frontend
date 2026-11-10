import { createVercelHandler } from '@api-server/vercel'
import { createMerklServer } from '@merkl-api/server'

export default createVercelHandler(createMerklServer())
