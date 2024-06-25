import { Request, Response, NextFunction } from 'express'
import AccessService from '../services/access.service'
import { UserSignUp } from '../types/users'
import { CREATED, OK } from '../utils/success.response'

class AccessController {
  signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, password } = req.body as UserSignUp
    CREATED(
      res,
      await AccessService.signUp({ email, name, password }),
      'Successfully signed up'
    )
  }

  signIn = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    OK(
      res,
      await AccessService.signIn({ email, password }, res),
      'Successfully signed in'
    )
  }

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body as { refreshToken?: string }
    const rfCookie = req.cookies['refreshToken']
    OK(
      res,
      await AccessService.refreshToken(refreshToken, rfCookie, res),
      'Token refreshed'
    )
  }
}

export default new AccessController()
