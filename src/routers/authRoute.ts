import * as express from "express"
import User from "../models/user"
import joi from "@hapi/joi"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"
import {registerValidation, loginValidation} from "../utils/validation";

const router = express.Router()

router.post("/register", async (req, res) => {
    const {error} = registerValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const emailExist = await User.findOne({email: req.body.email})
    if (emailExist) return res.status(400).send("Email already exists")

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    // res.send("Register")
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })

    try {
        const savedUser = await user.save()
        res.send({user: user._id})
    } catch (err) {
        res.status(400).send(err)
    }
})

router.post("/login", async (req, res) => {
    const {error} = loginValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const userExist: any = await User.findOne({email: req.body.email})
    if (!userExist) return res.status(400).send("Email doesn't exist")
    const validPass = await bcrypt.compare(req.body.password, userExist.password)
    if (!validPass) return res.status(400).send("Invalid password")

    const token = jwt.sign({_id: userExist._id}, process.env.ACCESS_TOKEN_SECRET)
    res.header("auth-token", token).send(token)
    res.send("logged in!")
})

export default router