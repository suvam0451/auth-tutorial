import * as express from "express"
import User from "../models/user"
import joi from "@hapi/joi"
import bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"
import {registerValidation, loginValidation} from "../utils/validation";

const router = express.Router()

router.get("/", (req, res)=> {
    // res.send(req.user)
    // res.json({posts: {title: "My first post"}})
})