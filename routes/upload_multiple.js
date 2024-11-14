const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const archiver = require('archiver');
const { publishMessage } = require('../queue/publisher')
const { consumeMessage } = require('../queue/consumer')

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads'),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname)
            cb(null, `${file.originalname.split('.')[0]}-${Date.now()}${ext}`)
        }
    })
})


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
                await publishMessage('image_processing', message)
                const pdfPath = await consumeMessage()
                pdfPaths.push(pdfPath)
            } catch (error) {
                console.error("Error processing file:", file.originalname, error);
            }
        }

        pdfPaths.forEach((pdfPath) => {
            if (!fs.existsSync(pdfPath)) {
                console.warn(`File missing: ${pdfPath}`);
            }
        });

        console.log(pdfPaths)

        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(output);

        pdfPaths.forEach(pdfPath => {
            archive.file(pdfPath, { name: path.basename(pdfPath) });
        });

        output.on('close', () => {
            console.log(`ZIP file created with size: ${archive.pointer()} bytes`);
        });

        await archive.finalize();

        res.json({
            success: true,
            zipPath: `/download/${zipFileName}`,
            message: 'Files upload request sent, processing...',
            uploadType: 'multiple'
        });
    } catch (error) {
        console.error("Error during multiple file upload:", error);
        res.status(500).json({ error: 'An error occurred during multiple file upload' });
    }
});

module.exports = router