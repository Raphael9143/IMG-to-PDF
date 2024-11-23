const { consumeMessage } = require('../queue/consumer');
const { publishMessage } = require('../queue/publisher');
const { translate } = require('../utils/translate');

async function processTranslateMessage(message) {
    try {
        const viText = await translate(message.text);
        const outputMessage = { viText, outputFilePath: message.outputFilePath };

        // Gửi văn bản đã dịch đến pdfQueue để tạo PDF
        await publishMessage('pdfQueue', outputMessage);
    } catch (error) {
        console.error('Error translating text:', error);
    }
}

function startTranslateFilter() {
    consumeMessage('translateQueue', processTranslateMessage);
}
  
module.exports = { startTranslateFilter };
