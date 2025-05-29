import { ValidationError } from "class-validator";

export const formatErrors = (errors: ValidationError[]) => {
  return errors.map((error) => {
    const messages: string[] = error.constraints
      ? Object.values(error.constraints)
      : [];
    return {
      property: error.property,
      message: messages.join(", "),
    };
  });
};
