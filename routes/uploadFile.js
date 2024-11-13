const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { sendToQueue } = require('../queue/publisher')
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

router.post('/', upload.single('singleImage'), async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'Please upload a file!' });
        }
        const text = await image2text(file.path);
        const translatedText = await translate(text);
        const pdfPath = await createPDF(translatedText, file.originalname);

        res.json({ 
            success: true,
            pdfPath: pdfPath,
            uploadType: 'single',

        })

    } catch (error) {
        console.error("Error during file upload:", error);
        res.status(500).json({ error: 'An error occurred during file upload' });
    }
});

module.exports = router