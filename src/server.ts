import * as express from "express"
import * as jwt from "jsonwebtoken"
import * as mongoose from "mongoose"
import * as dotenv from "dotenv"
import * as moment from "moment"
import * as upload from "express-fileupload"
import * as socketio from "socket.io"
import {exec} from "child_process"
import * as chokidar from "chokidar"
import * as cors from "cors"

// Routes
import exampleRoute from "./routers/authRoute"
import logger from "./utils/logger"
import bookRouter from "./routers/books"
import DateTimeFormat = Intl.DateTimeFormat;
import uploadTutorialRoute from "./routers/uploadTutorialRoute"

import * as path from "path";

dotenv.config()
// dotenv.config({path: __dirname + '/.env'});

// mongoose.connect(process.env.MONGODB_ACCESS_TOKEN,
//     {useNewUrlParser: true, useUnifiedTopology: true},
//     () => console.log("connected to DB"))

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true},
    (err) => {
        if (err) {
            console.log("Error connecting to DB")
        } else {
            console.log("Connected to DB !")
        }
    })

const app = express()
let http = require("http").Server(app)
let io = require("socket.io")(http)

io.on("connection", (req, res) => {
    console.log("a user connected")
})

app.use(logger)
app.use(express.json())
app.use("/api/user", exampleRoute)
app.use("/api/books", bookRouter)
app.use("/api/upload", uploadTutorialRoute)

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

app.get("/api/request/:id", (req, res) => {
    res.send(req.params.id)
})

type RedditScrapeEntry = {
    board: string,
    status: "success" | "failed" | "running"
    timestamp: string
}

let RedditScrapeTracker: RedditScrapeEntry[] = []

app.get("/api/v1/reddit/status/:board", (req, res) => {
    const BOARD_TARGET = req.params.board
    const doesBoardExist = RedditScrapeTracker.some(obj =>
        obj.board == BOARD_TARGET)

    if (!doesBoardExist) {
        res.sendStatus(404)
    } else {
        const boardObject = RedditScrapeTracker.find(obj => obj.board == BOARD_TARGET)
        switch (boardObject.status) {
            case "success":
                res.sendStatus(200);
                break;
            case "failed":
                res.sendStatus(200);
                break;
            case "running":
                res.sendStatus(102);
                break;
            default:
                res.sendStatus(400);
                break;
        }
    }
})

app.put("/api/v1/reddit/:board", (req, res) => {
    const REGEX_PATTERN_REDDIT = "https://www.reddit.com/r/OneTrueTohsaka/"
    const DOWNLOAD_LOCATION_REDDIT = path.join(process.env.DOWNLOAD_FOLDER || "/srv/Downloads/", "Rips/Reddit")
    const COMMAND_BASE = `java -jar ${process.env.RIPME_LOCATION || "/opt/ripme.jar"}`
    const BOARD_TARGET = req.params.board

    // const watcher = chokidar.watch("/home/suvam/", {persistent: true})
    // let numFiles = 0;
    // watcher.on("add", (path) => {
    //     console.log(`File ${path} changed... Number of files: ${numFiles++}`)
    // })
    const command = `${COMMAND_BASE} -u https://www.reddit.com/r/${BOARD_TARGET}/ -l ${DOWNLOAD_LOCATION_REDDIT}`


    const isBoardBeingScraped = RedditScrapeTracker.some(obj =>
        obj.board == BOARD_TARGET && obj.status == "running")

    // Return conflict if the associated task is already running
    if (isBoardBeingScraped) {
        res.sendStatus(409)
        return
    }

    // Start a background process to scrape content, if no conflict found
    RedditScrapeTracker.push({
        board: BOARD_TARGET,
        status: "running",
        timestamp: moment().format()
    })
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log(err)
            console.log(`err: Request Reddit/${BOARD_TARGET} failed`)
            RedditScrapeTracker.push({
                board: BOARD_TARGET,
                status: "failed",
                timestamp: moment().format()
            })
        } else if (stderr) {
            console.log(`stderr: Request Reddit/${BOARD_TARGET} failed`)
            RedditScrapeTracker.push({
                board: BOARD_TARGET,
                status: "failed",
                timestamp: moment().format()
            })
        } else {
            console.log(`success: Request Reddit/${BOARD_TARGET} succeeded`)
            const idx = RedditScrapeTracker.findIndex(obj => obj.board == BOARD_TARGET)
            if (idx == -1) {
                RedditScrapeTracker.push({
                    board: BOARD_TARGET,
                    status: "success",
                    timestamp: moment().format()
                })
            } else {
                RedditScrapeTracker[idx] = {
                    ...RedditScrapeTracker[idx],
                    status: "success"
                }
            }
        }
    })
    res.sendStatus(200)
})
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

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))