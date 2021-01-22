/*
*   authRoutes handles entry points for new user registration and
*   token generation/refresh
* */
import * as cors from "cors";
import * as express from "express"
import * as fileUpload from "express-fileupload";
import {RequestHandler} from "express";

const router = express.Router()

router.post("/", cors(), fileUpload(), (req, res, next) => {
    if (req.files === null) {
        return res.status(400).json({msg: "No file found"})
    }
    const targetFile: any = req.files.file
    targetFile.mv(`${__dirname}/${targetFile.name}`, err => {
        console.log(err)
        return res.status(500).send(err)
    })

    res.json({fileName: targetFile.name, filePath: `/uploads/${targetFile.name}`})
    next()
})

export default router