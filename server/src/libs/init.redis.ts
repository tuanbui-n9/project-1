import * as Redis from 'redis'
import appConfig from '../configs'

interface Client {
  instanceRedis?: Redis.RedisClientType
}

let client: Client = {},
  statusConnectRedis = {
    CONNECT: 'connect',
    END: 'end',
    RECONNECT: 'reconnecting',
    ERROR: 'error',
  },
  connectionTimeout: NodeJS.Timeout

const REDIS_CONNECTION_TIMEOUT = 10000,
  REDIS_CONNECTION_MESSAGE = {
    code: -99,
    message: 'Redis connection timeout 🕒',
  }

const handleTimeoutError = () => {
  connectionTimeout = setTimeout(() => {
    console.error(REDIS_CONNECTION_MESSAGE.message)
    process.exit(REDIS_CONNECTION_MESSAGE.code)
  }, REDIS_CONNECTION_TIMEOUT)
}

const handleEventConnect = async (connectRedis: Redis.RedisClientType) => {
  connectRedis.on(statusConnectRedis.CONNECT, () => {
    console.log('::: Redis connected successfully 🚀')
    clearTimeout(connectionTimeout)
  })

  connectRedis.on(statusConnectRedis.END, () => {
    console.log('::: Redis connection closed 🚪')
    handleTimeoutError()
  })

  connectRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log('::: Redis reconnecting... 🔄')
    clearTimeout(connectionTimeout)
  })

  connectRedis.on(statusConnectRedis.ERROR, (err) => {
    console.log(`::: Redis error: ${err} 🚨`)
  })
}

const initRedis = () => {
  const instanceRedis = Redis.createClient({
    url: appConfig.REDIS_HOST,
  }) as Redis.RedisClientType

  instanceRedis.connect()

  client.instanceRedis = instanceRedis

  handleEventConnect(instanceRedis)
}

const getRedis = () => client

const closeRedis = () => {}

export { initRedis, getRedis, closeRedis }
