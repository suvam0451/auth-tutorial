import * as express from "express"
import * as jwt from "jsonwebtoken"

import * as dotenv from "dotenv";

dotenv.config({path: __dirname + '/.env'});

const app = express()

app.use(express.json())
let refreshTokens = []

// app.post("/token", (req, res)=> {
//     const refreshToken = req.body.token
//     if (refreshToken == null) return res.sendStatus(401)
//     if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
//     jwt.verify(refresh)
// })