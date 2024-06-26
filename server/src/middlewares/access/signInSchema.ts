import * as Joi from 'joi'

export const signInSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
})
