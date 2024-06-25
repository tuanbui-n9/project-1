import { Router } from 'express'
import AccessController from '../../controllers/access.controller'
import { asyncHandler } from '../../helpers/asyncHandler'
import { validateRequest } from '../../middlewares'
import { signInSchema, signUpSchema } from '../../middlewares/access'

const accessRouter = Router()

accessRouter.post(
  '/sign-up',
  validateRequest(signUpSchema),
  asyncHandler(AccessController.signUp)
)
accessRouter.post(
  '/sign-in',
  validateRequest(signInSchema),
  asyncHandler(AccessController.signIn)
)
accessRouter.post('/refresh-token', asyncHandler(AccessController.refreshToken))

export default accessRouter
