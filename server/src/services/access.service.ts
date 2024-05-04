import userModel from '../models/user.model'
import * as bcrypt from 'bcrypt'
import { UserSignUp } from '../types/users'

class AccessService {
  static signUp = async ({ name, email, password }: UserSignUp) => {
    const existingUser = await userModel.findOne({ email }).lean()
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = await userModel.create({
      name,
      email,
      password: passwordHash,
      roles: ['admin'],
    })

    if (newUser) {
    }

    return newUser
  }
}

export default AccessService
