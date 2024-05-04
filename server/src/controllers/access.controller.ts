import { Request, Response, NextFunction } from 'express'
import AccessService from '../services/access.service'
import { UserSignUp } from '../types/users'

class AccessController {
  signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, password } = req.body as UserSignUp
    return AccessService.signUp({ email, name, password })
  }
}

export default new AccessController()
