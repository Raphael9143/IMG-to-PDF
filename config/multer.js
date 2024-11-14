const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname)
        const filename = file.originalname.split('.')[0] + '-' + Date.now() + extname
        cb(null, filename)
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedExt = /jpg|png/
        const extname = allowedExt.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedExt.test(file.mimetype)
        
        if (extname && mimetype) {
            return cb(null, true)
        } else {
            cb(new Error('Only .jpg or .png files are allowed.'))
        }
    }
})

module.exports = upload