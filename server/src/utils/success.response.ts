import { Response } from 'express'
import { httpStatusCode } from '../constants/httpStatusCode'

class SuccessResponse<T, O = {}> {
  data: T
  message: string
  options: O
  status: number
  constructor(
    data: T,
    message: string,
    status = httpStatusCode.OK,
    options = {} as O
  ) {
    this.data = data
    this.message = message
    this.status = status
    this.options = options
  }

  send(res: Response) {
    return res.status(this.status).json(this)
  }
}

class Ok<T, O = {}> extends SuccessResponse<T, O> {
  constructor(data: T, message: string, options: O = {} as O) {
    super(data, message, httpStatusCode.OK, options)
  }
}

class Create<T, O = {}> extends SuccessResponse<T, O> {
  constructor(data: T, message: string, options: O = {} as O) {
    super(data, message, httpStatusCode.CREATED, options)
  }
}

const OK = <T, O = {}>(
  res: Response,
  data: T,
  message: string,
  options: O = {} as O
) => {
  return new Ok(data, message, options).send(res)
}

const CREATED = <T, O = {}>(
  res: Response,
  data: T,
  message: string,
  options: O = {} as O
) => {
  return new Create(data, message, options).send(res)
}

export { OK, CREATED }
