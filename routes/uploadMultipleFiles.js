const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { image2text } = require('../utils/ocr')
const { createPDF } = require('../utils/pdf')
const { translate } = require('../utils/translate')

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads'),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname)
            cb(null, `${file.originalname.split('.')[0]}-${Date.now()}${ext}`)
        }
    })
})


router.post('/', upload.array('multipleImage', 5), async (req, res, next) => {
    if (files.length > 5) {
        return res.status(400).json({ error: 'Cannot upload more than 5 files.' });
    }
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'Please upload one or more files!' });
        }
        const pdfPaths = []
        for (let file of files) {
            const text = await image2text(file.path)
            const translatedText = await translate(text)
            const pdfPath = createPDF(translatedText)
            pdfPaths.push(pdfPath)
        }
        res.json({ success: true, pdfPaths: pdfPaths });
    } catch (error) {
        console.error("Error during multiple file upload:", error);
        res.status(500).json({ error: 'An error occurred during multiple file upload' });
    }
});

module.exports = router