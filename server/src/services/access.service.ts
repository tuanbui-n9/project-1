import userModel from '../models/user.model'
import * as bcrypt from 'bcrypt'
import { UserSignUp } from '../types/users'
import * as Auth from '../utils/auth'
import {
  BadRequestError,
  InternalError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/error.response'
import { Response } from 'express'

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

    if (!newUser) {
      throw new InternalError('Failed to create user')
    }

    const { token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt } =
      await Auth.generateToken({
        userId: newUser._id.toString(),
        email: newUser.email,
        roles: newUser.roles,
      })

    return {
      user: newUser,
      token,
      refreshToken,
      tokenExpiresAt,
      refreshTokenExpiresAt,
    }
  }

  static signIn = async (
    {
      email,
      password,
    }: {
      email: string
      password: string
    },
    res: Response
  ) => {
    const existingUser = await userModel.findOne({ email }).lean()
    if (!existingUser) {
      throw new BadRequestError('User with this email does not exist')
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password)
    if (!passwordMatch) {
      throw new BadRequestError('Invalid password')
    }

    const { token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt } =
      await Auth.generateToken({
        userId: existingUser._id.toString(),
        email: existingUser.email,
        roles: existingUser.roles,
      })

    res.cookie('refreshToken', refreshToken, {
      path: '/',
      maxAge: (refreshTokenExpiresAt - Date.now()) / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      signed: true,
    })

    return {
      user: existingUser,
      token,
      refreshToken,
      tokenExpiresAt,
      refreshTokenExpiresAt,
    }
  }

  static refreshToken = async (
    rf: string | undefined,
    rfCookie: string | undefined,
    res: Response
  ) => {
    if (!rf && !rfCookie) {
      throw new NotFoundError('Invalid refresh token')
    }

    const refreshToken = rfCookie || rf

    if (!refreshToken) {
      throw new UnauthorizedError('Invalid refresh token')
    }

    const userId = await Auth.getRefreshTokenFromRedis(refreshToken)

    if (!userId) {
      throw new UnauthorizedError('Expired refresh token')
    }
    const activeRefreshToken = await Auth.getActiveRefreshToken(userId)

    if (activeRefreshToken !== refreshToken) {
      await Auth.deleteRefreshTokenFromRedis(refreshToken)
      throw new UnauthorizedError('Invalid refresh token')
    }

    const existingUser = await userModel.findById(userId).lean()
    if (!existingUser) {
      throw new NotFoundError('User not found')
    }

    const [
      _,
      {
        token,
        refreshToken: newRefreshToken,
        tokenExpiresAt,
        refreshTokenExpiresAt,
      },
    ] = await Promise.all([
      Auth.deleteRefreshTokenFromRedis(refreshToken),
      await Auth.generateToken({
        userId: existingUser._id.toString(),
        email: existingUser.email,
        roles: existingUser.roles,
      }),
    ])

    res.cookie('refreshToken', newRefreshToken, {
      path: '/',
      maxAge: (12 - Date.now()) / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      signed: true,
    })

    return {
      token,
      refreshToken: newRefreshToken,
      tokenExpiresAt,
      refreshTokenExpiresAt,
    }
  }
}

export default AccessService
