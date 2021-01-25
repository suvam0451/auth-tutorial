import * as express from "express"
import * as mongoose from "mongoose"
import * as dotenv from "dotenv"

// Routes
import exampleRoute from "./routers/authRoute"
import logger from "./utils/logger"
import bookRouter from "./routers/books"
import uploadTutorialRoute from "./routers/uploadTutorialRoute"
import redditRoute from "./routers/redditRoute"

dotenv.config()

const PORT = process.env.PORT || 4000

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
app.use("/api/reddit", redditRoute)


app.listen(PORT, () => console.log(`Server started on port ${PORT}`))