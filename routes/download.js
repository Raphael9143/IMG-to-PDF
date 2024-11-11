const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

router.get('/:filename', (req, res) => {
    const filename = req.params.filename
    const filePath = path.join(__dirname, '../output', filename)

    if (fs.existsSync(filePath)) {
        res.download(filePath)
    } else {
        res.status(404).json({ error: 'file not found'})
    }
})