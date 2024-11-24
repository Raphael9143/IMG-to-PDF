
const {createPDF} = require('../utils/pdf');
const {parentPort} = require('worker_threads');
async function processPDFMessage(message) {
    try {
        const outputFilePath = await createPDF(message.viText, message.outputFilePath);
        //console.log(`PDF created successfully at: ${outputFilePath}`);

        parentPort.postMessage(`PDF created successfully at: ${outputFilePath}`);

    } catch (error) {
        console.error('Error creating PDF:', error);
    }
}

parentPort.on('message', async (message) => {
    await processPDFMessage(message);
    parentPort.postMessage('ready');
});

module.exports = processPDFMessage;