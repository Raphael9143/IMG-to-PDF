const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


function createPDF(text, filename) {
    return new Promise((resolve, reject) => {
        const outputFilePath = `output/${filename.split('.')[0]}.pdf`;
        const doc = new PDFDocument();

        // Xử lý ghi tệp
        const stream = fs.createWriteStream(outputFilePath);
        doc.pipe(stream);
        doc.font('font/Roboto-Regular.ttf')
            .fontSize(14)
            .text(text, 100, 100);
        doc.end();

        // Đợi cho đến khi hoàn thành ghi
        stream.on('finish', () => resolve(outputFilePath));
        stream.on('error', (error) => reject(error));
    });
}

module.exports = {
    createPDF
}