const { consumeMessage } = require('../queue/consumer');
const { publishMessage } = require('../queue/publisher');
const { createPDF } = require('../utils/pdf');

async function processPDFMessage(message) {
    try {
        const outputFilePath = await createPDF(message.viText, message.outputFilePath);
        console.log(`PDF created successfully at: ${outputFilePath}`);

    } catch (error) {
        console.error('Error creating PDF:', error);
    }
}

function startPDFFilter() {
    consumeMessage('pdfQueue', processPDFMessage);
  }
  
  module.exports = { startPDFFilter };