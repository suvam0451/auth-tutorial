import * as joi from "@hapi/joi"

const registerSchema = {
    name: joi.string().min(6).required(),
    email: joi.string().min(6).required().email(),
    password: joi.string().min(6).required()
}

const loginSchema = {
    email: joi.string().min(6).required().email(),
    password: joi.string().min(6).required()
}


export function registerValidation(body: any) {
    return joi.validate(body, registerSchema)
}

export function loginValidation(body: any) {
    return joi.validate(body, loginSchema)
}
