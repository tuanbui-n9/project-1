type EnvironmentConfig = {
  DB_HOST: string
  PORT: string
  API_VERSION: string
  REDIS_HOST: string
  JWT_SECRET: string
}

class AppConfig {
  private static instance: AppConfig
  public readonly config: EnvironmentConfig

  private constructor() {
    this.config = {
      DB_HOST: process.env.DB_HOST || 'mongodb://localhost:27017/express-mongo',
      PORT: process.env.PORT || '3000',
      API_VERSION: process.env.API_VERSION || 'v1',
      REDIS_HOST: process.env.REDIS_HOST || 'redis://localhost:6379',
      JWT_SECRET: process.env.JWT_SECRET || 'secret',
    }

    this.validateConfig()
  }

  public static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig()
    }
    return AppConfig.instance
  }

  private validateConfig() {
    Object.entries(this.config).forEach(([key, value]) => {
      if (!value) {
        throw new Error(`${key} is not defined in .env file`)
      }
    })
  }
}

const appConfig = AppConfig.getInstance().config

export default appConfig
