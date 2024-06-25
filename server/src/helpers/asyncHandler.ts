import { Request, Response, NextFunction } from 'express'

type AsyncFunction<T = void> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>

export const asyncHandler =
  <T = void>(fn: AsyncFunction<T>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next)
