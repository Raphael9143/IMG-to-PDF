const { consumeMessage } = require('../queue/consumer');
const { publishMessage } = require('../queue/publisher');
const { image2text } = require('../utils/ocr');

async function processOCRMessage(message) {
  try {
    const { filePath, fileName } = message;
    const text = await image2text(filePath);
    
    if (text) {
      const outputMessage = { text, outputFilePath: `${fileName}.pdf` };
      
      // Gửi văn bản OCR đến hàng đợi translateQueue
      await publishMessage('translateQueue', outputMessage);
      console.log('OCR text sent to translateQueue:', outputMessage);
    } else {
      console.error('No text extracted from image.');
    }
  } catch (error) {
    console.error('Error processing OCR message:', error);
  }
}

function startOCRFilter() {
  consumeMessage('imageQueue', processOCRMessage);
}

module.exports = { startOCRFilter };
