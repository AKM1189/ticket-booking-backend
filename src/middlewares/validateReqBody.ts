import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { formatErrors } from "../utils/formatErrors";

export function validateDto<T extends Object>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json({ error: formattedErrors });
      return;
    }
    next();
  };
}
