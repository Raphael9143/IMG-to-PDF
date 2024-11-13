// npm i archiver
const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const archiver = require('archiver');
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
            // const text = await image2text(file.path)
            // var fs = require('fs');
            // var enText = fs.readFileSync('stdout.txt').toString()
            // const translatedText = await translate(enText)
            // const pdfPath = createPDF(translatedText, file.originalname)
            // pdfPaths.push(pdfPath)
            try {
                console.log("Processing file:", file.originalname);
                const text = await image2text(file.path);
                const translatedText = await translate(text);
                const pdfPath = await createPDF(translatedText, file.originalname);
                pdfPaths.push(pdfPath);
                console.log("PDF created and added to zip:", pdfPath);
            } catch (error) {
                console.error("Error processing file:", file.originalname, error);
            }
        }
        // res.json({ 
        //     success: true, 
        //     pdfPaths: pdfPaths, 
        //     uploadType: 'multiple' 
        // })

        pdfPaths.forEach((pdfPath) => {
            if (!fs.existsSync(pdfPath)) {
                console.warn(`File missing: ${pdfPath}`);
            }
        });

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
            uploadType: 'multiple'
        });
    } catch (error) {
        console.error("Error during multiple file upload:", error);
        res.status(500).json({ error: 'An error occurred during multiple file upload' });
    }
});

module.exports = router