import fs from "node:fs";
import multer from "multer";
import { randomUUID } from "crypto"

export const multerLocal = ({ customPath = "general", costomTypes = [] } = {}) => {

  const fullPath = `uploads/${customPath}`
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath)
    },
    filename: (req, file, cb) => {
      cb(null, randomUUID() + "__" + file.originalname)
    }
  })

  function fileFilter(req, file, cb) {
    if (costomTypes.length && !costomTypes.includes(file.mimetype)) {
      cb(new Error("inValid file"))
    } else {
      cb(null, true)
    }
  }

  return multer({ storage, fileFilter })
}