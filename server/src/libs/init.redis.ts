import Redis from 'ioredis'
import appConfig from '../configs'

interface Client {
  instanceRedis: Redis
}

let client: Client = {
    instanceRedis: new Redis(appConfig.REDIS_HOST),
  },
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

const handleEventConnect = async (connectRedis: Redis) => {
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
  handleEventConnect(client.instanceRedis)
}

const getRedis = () => client

const closeRedis = () => {}

export { initRedis, getRedis, closeRedis }
