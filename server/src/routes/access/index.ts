import { Router } from 'express'
import AccessController from '../../controllers/access.controller'

const accessRouter = Router()

accessRouter.get('/signup', AccessController.signUp)

export default accessRouter
