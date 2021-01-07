import * as express from "express"
import * as jwt from "jsonwebtoken"
import * as mongoose from "mongoose"
import * as dotenv from "dotenv"

// Routes
import exampleRoute from "./routers/authRoute"

dotenv.config()
// dotenv.config({path: __dirname + '/.env'});

mongoose.connect(process.env.MONGODB_ACCESS_TOKEN,
    {useNewUrlParser: true, useUnifiedTopology: true},
    () => console.log("connected to DB"))


const app = express()
app.use(express.json())
app.use("/api/user", exampleRoute)

const PORT = process.env.PORT || 4000
const posts = [{
    username: "Kyle",
    title: "Post 1"
},
    {
        username: "Jim",
        title: "Post 2"
    }
]

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token: string | undefined = authHeader && authHeader.split(" ")[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15s"})
}

function generateRefreshToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15s"})
}


// app.get("/login", (req, res) => {
//     // Authenticate User
//
//     const username = req.body.username
//     const user = {name: username}
//
//     const accessTokens = generateAccessToken(user)
//     const refreshTokens = generateRefreshToken(user)
//     res.json({accessToken: accessTokens})
// })

// app.get("/posts", (req, res) => {
//     res.json(posts.filter(post => post.username == req.body.user.name))
// })

app.listen(PORT)