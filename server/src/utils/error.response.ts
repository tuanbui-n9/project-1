import { httpStatusCode } from '../constants/httpStatusCode'
import { reasonPhrases } from '../constants/reasonPhrases'

class ErrorResponse extends Error {
  status: number
  message: string

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

class ConflictError extends ErrorResponse {
  constructor(
    message: string = reasonPhrases.CONFLICT,
    status: number = httpStatusCode.CONFLICT
  ) {
    super(message, status)
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message: string = reasonPhrases.BAD_REQUEST,
    status: number = httpStatusCode.BAD_REQUEST
  ) {
    super(message, status)
  }
}

export { ErrorResponse, ConflictError, BadRequestError }
