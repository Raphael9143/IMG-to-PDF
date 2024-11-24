const { parentPort, workerData } = require('worker_threads');
const { publishMessage } = require('../queue/publisher');
const {translate} = require('../utils/translate');

async function processTranslateMessage(message) {
    try {
        const viText = await translate(message.text);
        const outputMessage = { viText, outputFilePath: message.outputFilePath };

        // Gửi văn bản đã dịch đến pdfQueue để tạo PDF
        await publishMessage('pdfQueue', outputMessage);

        parentPort.postMessage(`Translated text sent to pdfQueue: ${JSON.stringify(outputMessage)}`);


    } catch (error) {
        return `Error translating text: ${error.message}`;
    }
}
parentPort.on('message', async (message) => {
    await processTranslateMessage(message);
    parentPort.postMessage('ready');
});

module.exports= processTranslateMessage;