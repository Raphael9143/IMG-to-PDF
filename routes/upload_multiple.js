const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const { publishMessage } = require('../queue/publisher')

const upload = require('../config/multer')


router.post('/',  upload.any('multipleImage'), async (req, res, next) => {
    try {
        const files = req.files;

        const pdfPaths = []

        for (let file of files) {
            try {
                const message = {
                    fileName: file.originalname,
                    filePath: file.path
                }
                await publishMessage('imageQueue', message)
                const pdfPath = path.join(__dirname, '../output', `${file.originalname.split('.')[0]}.pdf`)
                pdfPaths.push(pdfPath)
            } catch (error) {
                console.error("Error processing file:", file.originalname, error);
            }
        }

        const allExist = pdfPaths.every(pdfPath => fs.existsSync(pdfPath))

        // SOLUTION 1: multiple pdf files download button.
        pdfPaths.forEach((pdfPath) => {
            if(!fs.existsSync(pdfPath)) {
                console.warn(`File missing: ${pdfPath}`);
            }
        })

        if (allExist) {
            res.json({
                success: true,
                pdfPaths: pdfPaths.map(pdfPath => `/download/${path.basename(pdfPath)}`),
                message: 'Files upload request sent, processing...',
                uploadType: 'multiple'
            })
        }
    

        // const zipPath = path.join(__dirname, '../output', 'translated_files.zip')
        // await createZip(pdfPaths, zipPath)

        // res.json({
        //     success: true,
        //     zipPath: `/download/${path.basename(zipPath)}`,
        //     uploadType: 'multiple'
        // })


    } catch (error) {
        console.error("Error during multiple file upload:", error);
        res.status(500).json({ error: 'An error occurred during multiple file upload' });
    }
});

module.exports = router