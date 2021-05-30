const joi = require("joi");

const registerSchema = joi.object({
  name: joi.string().required().min(3),
  email: joi.string().trim().required().email({ minDomainSegments: 2 }),
  password: joi.string().required().min(6),
  phone: joi
    .string()
    .required()
    .pattern(new RegExp(/(^(\+8801|8801|01|008801))[1|3-9]{1}(\d){8}$/))
    .messages({ "string.pattern.base": "Invalid phone" }),
});

const verifySchema = joi.object({
  email: joi.string().trim().required().email({ minDomainSegments: 2 }),
  code: joi.string().required().min(6),
});

const loginSchema = joi.object({
  email: joi.string().trim().required().email({ minDomainSegments: 2 }),
  password: joi.string().required().min(6),
});

module.exports = { registerSchema, verifySchema, loginSchema };
