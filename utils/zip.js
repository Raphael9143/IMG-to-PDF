const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

async function createZip(pdfPaths, outputZipPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputZipPath)
        const archive = archiver('zip', { zlib: { level: 9 } })

        output.on('close', () => {
            console.log(`Zip file has been finalized.`)
            resolve(outputZipPath)
        })

        archive.on('error', (err) => {
            reject(err)
        })

        archive.pipe(output)

        for (let pdfPath of pdfPaths) {
            archive.file(pdfPath, { name: path.basename(pdfPath) })
        }

        archive.finalize()
    })
} 

module.exports = { createZip }