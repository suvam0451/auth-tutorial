import * as express from "express"
import * as bookController from "../controllers/book"

const router = express.Router()
router.get("/", bookController.allBooks)
router.get("/:id", bookController.getBook)
router.put("/", bookController.addBook)
router.delete("/", bookController.deleteBook)
router.post("/:id", bookController.updateBook)

export default router