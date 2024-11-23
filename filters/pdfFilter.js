const { consumeMessage } = require('../queue/consumer');
const { publishMessage } = require('../queue/publisher');
const { createPDF } = require('../utils/pdf');

async function processPDFMessage(message) {
    try {
        await createPDF(refactorText(message.viText), message.outputFilePath);

    } catch (error) {
        console.error('Error creating PDF:', error);
    }
}

function refactorText(text) {
    return text.replace(/(\r\n|\n|\r)/gm, " ");
}

function startPDFFilter() {
    consumeMessage('pdfQueue', processPDFMessage);
}
  
module.exports = { startPDFFilter };