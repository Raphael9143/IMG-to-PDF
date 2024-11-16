const { createPDF } = require('../../utils/pdf');

class pdfFilter {
    async process(message) {
        const outputFilePath = await createPDF(message.viText, message.output);
        console.log(`PDF created successfully at: ${outputFilePath}`);
        return { ...message, outputFilePath }
    }
}

module.exports = pdfFilter