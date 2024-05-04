import mongoose from 'mongoose'
import appConfig from '../configs'

class Database {
  static instance: Database
  constructor() {
    this.connect()
  }

  connect(type = 'mongodb') {
    mongoose
      .connect(appConfig.DB_HOST || 'mongodb://localhost:27017/express-mongo')
      .then(() => {
        console.log('::: Database connected successfully 🚀')
      })
      .catch((err) => {
        console.error('::: Database connection error 🥶')
        process.exit(1) // Fail fast if database connection failed
      })
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }
}

const instanceMongodb = Database.getInstance()

export default instanceMongodb
