import * as JWT from 'jsonwebtoken'
import * as crypto from 'node:crypto'
import * as bcrypt from 'bcrypt'
import appConfig from '../configs/index'
import { BadRequestError } from './error.response'
import { getRedis } from '../libs/init.redis'
const { instanceRedis } = getRedis()

const token = Object.freeze({
  JWT_TOKEN_EXPIRES: 1000 * 60 * 15,
  REFRESH_TOKEN_EXPIRES: 1000 * 60 * 60 * 24 * 3,
})

const setTokenToRedis = async ({
  userId,
  token,
  refreshToken,
  tokenExpiresAt,
  refreshTokenExpiresAt,
}: {
  userId: string
  token: string
  refreshToken: string
  tokenExpiresAt: number
  refreshTokenExpiresAt: number
}) => {
  const now = Date.now()
  const tokenExpiresIn = tokenExpiresAt - now
  const refreshTokenExpiresIn = refreshTokenExpiresAt - now

  await instanceRedis
    .multi()
    .set(`auth:token:${userId}`, token, 'PX', tokenExpiresIn)
    .set(
      `auth:refreshToken:${userId}`,
      refreshToken,
      'PX',
      refreshTokenExpiresIn
    )
    .set(`auth:${refreshToken}`, userId, 'PX', refreshTokenExpiresIn)
    .exec()
}

const getTokenFromRedis = async (userId: string) => {
  return instanceRedis.get(`auth:token:${userId}`)
}

const deleteTokenFromRedis = async (userId: string) => {
  return instanceRedis.del(`auth:token:${userId}`)
}

const getRefreshTokenFromRedis = async (
  refreshToken: string
): Promise<string | null> => {
  // get userId from refreshToken
  return instanceRedis.get(`auth:${refreshToken}`)
}

const getActiveRefreshToken = async (userId: string) => {
  return instanceRedis.get(`auth:refreshToken:${userId}`)
}

const deleteRefreshTokenFromRedis = async (refreshToken: string) => {
  return instanceRedis.del(`auth:${refreshToken}`)
}

const signIdToken = async ({
  userId,
  email,
  roles,
  expiresIn = token.JWT_TOKEN_EXPIRES,
}: {
  userId: string
  email: string
  roles: string[]
  expiresIn?: number
}) => {
  const now = Date.now()
  const expiresAt = now + expiresIn

  const token = JWT.sign(
    {
      userId,
      email,
      roles: roles.join(','),
      exp: Math.floor(now / 1000) + Math.floor(expiresIn / 1000),
    },
    appConfig.JWT_SECRET
  )

  return {
    token,
    expiresAt,
  }
}

const createRefreshToken = async (expiresIn = token.REFRESH_TOKEN_EXPIRES) => {
  const refreshToken = crypto.randomBytes(64).toString('hex')
  const expiresAt = Date.now() + expiresIn

  return {
    refreshToken,
    expiresAt,
  }
}

const generateToken = async ({
  userId,
  email,
  roles,
}: {
  userId: string
  email: string
  roles: string[]
}) => {
  const { token, expiresAt: tokenExpiresAt } = await signIdToken({
    userId,
    email,
    roles,
  })
  const { refreshToken, expiresAt: refreshTokenExpiresAt } =
    await createRefreshToken()

  // save token and refresh token to redis
  await setTokenToRedis({
    userId,
    token,
    refreshToken,
    tokenExpiresAt,
    refreshTokenExpiresAt,
  })

  return {
    token,
    tokenExpiresAt,
    refreshToken,
    refreshTokenExpiresAt,
  }
}

const verifyToken = async (token: string) => {
  try {
    return JWT.verify(token, appConfig.JWT_SECRET)
  } catch (error) {
    throw new BadRequestError('Invalid token')
  }
}

const isTokenExpired = async (token: string) => {
  try {
    const decoded = JWT.decode(token) as { exp: number }
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}

export {
  generateToken,
  createRefreshToken,
  verifyToken,
  isTokenExpired,
  comparePassword,
  setTokenToRedis,
  getTokenFromRedis,
  deleteTokenFromRedis,
  getRefreshTokenFromRedis,
  deleteRefreshTokenFromRedis,
  getActiveRefreshToken,
}
