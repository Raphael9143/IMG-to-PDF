const { parentPort } = require('worker_threads');
const { publishMessage } = require('../queue/publisher');
const { image2text } = require('../utils/ocr');

async function processOCRMessage(message) {
    try {
        const { filePath, fileName } = message;
        const text = await image2text(filePath);

        if (text) {
            const outputMessage = { text, outputFilePath: `${fileName}.pdf` };
            await publishMessage('translateQueue', outputMessage);

            // Thông báo cho main thread rằng message đã được xử lý và gửi đến hàng đợi translateQueue
            parentPort.postMessage(`Processed and sent to translateQueue: ${JSON.stringify(outputMessage)}`);
        } else {
            parentPort.postMessage('No text extracted from image.');
        }
    } catch (error) {
        parentPort.postMessage(`Error: ${error.message}`);
    }
}

// Lắng nghe message từ main thread
parentPort.on('message', async (message) => {
    await processOCRMessage(message);

    // Thông báo cho main thread rằng worker đã sẵn sàng
    parentPort.postMessage('ready');
});


// const { publishMessage } = require('../queue/publisher');
// const { image2text } = require('../utils/ocr');
//
//
//
// async function processOCRMessage(message) {
//     try {
//         const { filePath, fileName } = message;
//         const text = await image2text(filePath);
//
//         if (text) {
//             const outputMessage = { text, outputFilePath: `${fileName}.pdf` };
//             await publishMessage('translateQueue', outputMessage);
//             return `OCR text sent to translateQueue: ${JSON.stringify(outputMessage)}`;
//         } else {
//             return 'No text extracted from image.';
//         }
//     } catch (error) {
//         return `Error processing OCR message: ${error.message}`;
//     }
// }
//
// module.exports = processOCRMessage;