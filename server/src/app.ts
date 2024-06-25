import 'dotenv/config'
import * as express from 'express'
import { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import * as morgan from 'morgan'
import * as compression from 'compression'

const app = express()

// Initialize middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(morgan('dev'))
app.use(helmet())
app.use(compression())

// Initialize database
import './libs/init.mongodb'

// Initialize redis
import { initRedis } from './libs/init.redis'
initRedis()

// Initialize routes
import router from './routes'
import { ErrorResponse } from './utils/error.response'

app.use('/v1/api', router)

// Initialize error handling
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const error = new ErrorResponse('Not found', 404)
  return next(error)
})

app.use(
  (error: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.status || 500
    const response: { status: number; message: string; stack?: string } = {
      status: statusCode,
      message: error.message || 'Internal Server Error',
    }

    if (process.env.NODE_ENV !== 'production') {
      response.stack = error.stack
    }

    return res.status(statusCode).json(response)
  }
)
export default app
