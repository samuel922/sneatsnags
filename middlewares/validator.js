import Joi from "joi";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^+=_~\-])[A-Za-z\d@$!%*?#&^+=_~\-]{8,}$/;

const signupSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ["com", "net"] } }),

  password: Joi.string().required().pattern(passwordRegex).messages({
    "string.pattern.base":
      "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
  }),
});

const signinSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({ tlds: { allow: ["com", "net"] } }),

  password: Joi.string().required().pattern(passwordRegex).messages({
    "string.pattern.base":
      "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
  }),
});

export const validations = {
  signupSchema,
  signinSchema,
};
