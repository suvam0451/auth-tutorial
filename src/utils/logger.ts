import * as moment from "moment"

export default function logger(req, res, next) {
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}: ${moment().format()}`)
    next()
}