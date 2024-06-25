import { Router } from 'express'
import accessRouter from './access'

const router = Router()

router.use('/access', accessRouter)

export default router
