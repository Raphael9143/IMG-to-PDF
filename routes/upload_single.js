const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const { publishMessage } = require('../queue/publisher')
const upload = require('../config/multer')

router.post('/', upload.single('singleImage'), async (req, res, next) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'Please upload a file!' });
        }

        const message = {
            fileName: file.originalname,
            filePath: file.path
        }

        // await publishMessage('image_processing', message)
        await publishMessage('imageQueue', message);
        
        // const pdfPath = await consumeMessage()
        const pdfPath = `${file.originalname.split('.')[0]}.pdf`;
        const dirPath = path.join(__dirname, '../output', pdfPath)
        if (fs.existsSync(dirPath)) {
            res.json({
                success: true,
                pdfPath: pdfPath,
                message: 'File upload request sent, processing...',
                uploadType: 'single'
            })
        }

    } catch (error) {
        console.error("Error during file upload:", error);
        res.status(500).json({ error: 'An error occurred during file upload' });
    }
});

module.exports = router