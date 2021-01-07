import * as joi from "@hapi/joi"

const registerSchema = joi.object({
    name: joi.string().min(6).required(),
    email: joi.string().min(6).required().email(),
    password: joi.string().min(6).required()
})

const loginSchema = joi.object({
    email: joi.string().min(6).required().email(),
    password: joi.string().min(6).required()
})

// Functions

//
export function registerValidation(body: any) {
    return registerSchema.validate(body)
}

//
export function loginValidation(body: any) {
    return loginSchema.validate(body)
}
