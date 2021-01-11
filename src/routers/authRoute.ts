/*
*   authRoutes handles entry points for new user registration and
*   token generation/refresh
* */
import * as express from "express"
import User from "../models/user"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"
import {registerValidation, loginValidation} from "../utils/validation";

const router = express.Router()

/* New user registration route */
router.post("/register", async (req, res) => {
    // Validate input data for malformed input
    const {error} = registerValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // Check for duplicates by entry
    const emailExist = await User.findOne({email: req.body.email})
    if (emailExist) return res.status(400).send("Email already exists")

    // Encrypt password using salt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })

    // Save entry to DB and return response
    try {
        const _ = await user.save()
        res.send({user: user._id})
    } catch (err) {
        res.status(400).send(err)
    }
})

/* login route */
router.post("/login", async (req, res) => {
    // Validate input data for malformed input
    const {error} = loginValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // Check if the user entry exists in the database
    const userExist: any = await User.findOne({email: req.body.email})
    if (!userExist) return res.status(400).send("Email doesn't exist")

    // Check if the password matches the encrypted string
    const validPass = await bcrypt.compare(req.body.password, userExist.password)
    if (!validPass) return res.status(400).send("Invalid password")

    // Sign the user and return token
    const token = jwt.sign({_id: userExist._id}, process.env.ACCESS_TOKEN_SECRET)
    res.header("auth-token", token).send(token)
})

export default router