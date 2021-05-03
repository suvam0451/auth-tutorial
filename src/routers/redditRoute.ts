/*
*
* */
import * as express from "express"
import path from "path";
import * as moment from "moment";
import {exec} from "child_process";

const router = express.Router()

type RedditScrapeEntry = {
    board: string,
    status: "success" | "failed" | "running"
    timestamp: string
}
let RedditScrapeTracker: RedditScrapeEntry[] = []

router.get("/status/:board", (req, res) => {
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

router.put("/:board", (req, res) => {
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

export default router;