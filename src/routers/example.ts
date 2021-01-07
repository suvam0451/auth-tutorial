import * as express from "express"
import User from "../models/user"

const router = express.Router()

router.post("/register", async (req, res)=> {
    // res.send("Register")
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    console.log(user)
    try {
        const savedUser = await user.save()
        res.send(savedUser)
    } catch(err) {
        console.log(err)
        res.status(400).send(err)
    }
})

router.post("/login")

export default  router