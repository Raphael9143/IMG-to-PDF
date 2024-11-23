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
        upload.any('multipleImage')(req, res, (err) => {
            if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
                return res.status(400).json({ error: 'Maximum files allowed is 5!' });
            }
            next();
        });
    },
    async (req, res) => {
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({ error: 'Please upload one or more files!' });
            }

            for (let file of files) {
                const message = {
                    fileName: file.originalname,
                    filePath: file.path,
                };
                await publishMessage('imageQueue', message);
            }

            const zipFileName = `translated_files_${Date.now()}.zip`;
            const zipFilePath = path.join(__dirname, '../output', zipFileName);




            const intervalCheck = setInterval(async () => {
                const processedFiles = files.map((file) => {
                    const pdfPath = path.join(
                        __dirname,
                        '../output',
                        `${file.originalname.split('.')[0]}.pdf`
                    );
                    return pdfPath;
                });

                const allFilesExist = processedFiles.every((pdfPath) => fs.existsSync(pdfPath));
                if (allFilesExist) {
                    clearInterval(intervalCheck);


                    const output = fs.createWriteStream(zipFilePath);
                    const archive = archiver('zip', { zlib: { level: 9 } });

                    archive.on('error', (err) => {
                        throw err;
                    });

                    archive.pipe(output);

                    processedFiles.forEach((pdfPath) => {
                        archive.file(pdfPath, { name: path.basename(pdfPath) });
                    });

                    await archive.finalize();
                    console.log(`ZIP file created at ${zipFilePath}`);

                    res.json({
                        success: true,
                        zipPath: `/download/${zipFileName}`,
                        message: 'Files upload request sent, processing...',
                        uploadType: 'multiple',
                    });
                }
            }, 3000);
        } catch (error) {
            console.error('Error during multiple file upload:', error);
            res.status(500).json({ error: 'An error occurred during multiple file upload' });
        }
    }
);

module.exports = router