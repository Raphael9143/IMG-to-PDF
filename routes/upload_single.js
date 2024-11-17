const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { publishMessage } = require('../queue/publisher')
const upload = require('../config/multer')
const Pipeline = require('../pipes_filters/pipes/pipeline')
const ocrFilter = require('../pipes_filters/filters/ocrFilter')
const translateFilter = require('../pipes_filters/filters/translateFilter')
const pdfFilter = require('../pipes_filters/filters/pdfFilter')
const Filter = require('../pipes_filters/filters/filter')

const createPipeline = () => {
    const filter = new Filter()
    filter.add(new ocrFilter())
    filter.add(new translateFilter)
    filter.add(new pdfFilter())

    const pipeline = new Pipeline()
    pipeline.addFilter(filter)
    return pipeline
}

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
        console.log("try posting")
        const pipeline = createPipeline()
        console.log('successfully create pipeline')
        const result = await pipeline.execute(message)
        console.log(result)

        // await publishMessage('image_processing', message)
        await publishMessage('imageQueue', result);

        // const pdfPath = await consumeMessage()
        // const pdfPath = `${file.originalname.split('.')[0]}.pdf`;
        res.json({
            success: true,
            pdfPath: result.outputFilePath,
            message: 'File upload request sent, processing...',
            uploadType: 'single'
        })

    } catch (error) {
        console.error("Error during file upload:", error);
        res.status(500).json({ error: 'An error occurred during file upload' });
    }
});

module.exports = router