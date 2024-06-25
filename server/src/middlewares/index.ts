import * as Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import { BadRequestError } from '../utils/error.response'

export const validateRequest =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    if (error) {
      throw new BadRequestError(error.details[0].message)
    }
    next()
  }
