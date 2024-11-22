const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const archiver = require('archiver');
const { publishMessage } = require('../queue/publisher')
const { consumeMessage } = require('../queue/consumer')
const upload = require('../config/multer')

router.post('/', (req, res, next) => {
    upload.array('multipleImage', 5)(req, res, (err) => {
        if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ error: 'Maximum files allowed is 5!' })
        }
        next()
    })
}, async (req, res, next) => {
    if (req.files.length > 5) {
        return res.status(400).json({ error: 'Cannot upload more than 5 files.' });
    }
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'Please upload one or more files!' });
        }

        const pdfPaths = []
        const zipFileName = `translated_files_${Date.now()}.zip`;
        const zipFilePath = path.join(__dirname, '../output', zipFileName);

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

        await new Promise(resolve => setTimeout(resolve, 5000))
        pdfPaths.forEach((pdfPath) => {
            if(!fs.existsSync(pdfPath)) {
                console.warn(`File missing: ${pdfPath}`);
            }
        })

        // SOLUTION 1: multiple pdf files download button.
        // pdfPaths.forEach((pdfPath) => {
        //     if(!fs.existsSync(pdfPath)) {
        //         console.warn(`File missing: ${pdfPath}`);
        //     }
        // })
        //
        // res.json({
        //     success: true,
        //     pdfPaths: pdfPaths.map(pdfPath => `/download/${pdfPath}`),
        //     message: 'Files upload request sent, processing...',
        //     uploadType: 'multiple'
        // })

        // SOLUTION 2: zip file download button.
        const output = fs.createWriteStream(zipFilePath)
        const archive = archiver('zip', {
            zlib: { level: 9 }
        })

        archive.on('error', (err) => {
            console.error("Error during zip file creation:", err)
            throw err
        })

        archive.pipe(output)

        pdfPaths.forEach((pdfPath) => {
            if (!fs.existsSync(pdfPath)) {
                archive.file(pdfPath, { name: path.basename(pdfPath) })
            }
        })

        output.on('close', () => {
            console.log('Zip file created: ', zipFilePath)
        })

        await archive.finalize()

        res.json({
            success: true,
            zipPath: `/download/${zipFileName}`,
            message: 'Files upload request sent, processing...',
            uploadType: 'multiple'
        })

    } catch (error) {
        console.error("Error during multiple file upload:", error);
        res.status(500).json({ error: 'An error occurred during multiple file upload' });
    }
});

module.exports = router