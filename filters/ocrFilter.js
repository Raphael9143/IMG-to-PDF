const { Worker } = require('worker_threads');
const { consumeMessage } = require('../queue/consumer');
const path = require('path');

const workers = [];
const maxThreads = 2
let availableWorkers = [];
let messageQueue = [];

function startOCRFilter() {
    // Create a worker pool with maxThreads workers
    for (let i = 0; i < maxThreads; i++) {
        const worker = new Worker(path.resolve(__dirname, '../worker/ocrWorker.js'));
        workers.push(worker);
        availableWorkers.push(worker);

        worker.on('message', (message) => {
            if (message === 'ready') {
                availableWorkers.push(worker); // Add the worker back to the available pool
                processQueue();
            } else {
                console.log('OCR processing result:', message);
                availableWorkers.push(worker); // Add the worker back to the available pool
                processQueue();
            }
        });

        worker.on('error', (error) => {
            console.error('Worker error:', error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });
    }

    // Continuously consume messages from the queue
    consumeMessage('imageQueue', handleMessage);
    console.log('OCR filter started with competing consumers.');
}

function handleMessage(message) {
    if (availableWorkers.length > 0) {
        const worker = availableWorkers.pop();
        worker.postMessage(message);
    } else {
        messageQueue.push(message);
    }
    // Continuously consume messages
    consumeMessage('imageQueue', handleMessage);
}

function processQueue() {
    while (availableWorkers.length > 0 && messageQueue.length > 0) {
        const worker = availableWorkers.pop();
        const message = messageQueue.shift();
        worker.postMessage(message);
    }
}

module.exports = { startOCRFilter };


// if (isMainThread) {
//
//   const piscina = new Piscina({
//     filename: path.resolve(__dirname, '../worker/ocrWorker.js'),
//     maxThreads: 4, // Số lượng worker pool
//   });
//   function startOCRFilter() {
//     consumeMessage('imageQueue', (message) => {
//         // thực hiện xử lý message bằng worker pool
//         piscina.run(message)
//             .then((result) => {
//             console.log(result);
//         })
//             .catch((error) => {
//               console.log(error);
//             });
//     });
//   }
//
//   module.exports = { startOCRFilter };
// }

// const { consumeMessage } = require('../queue/consumer');
// const { publishMessage } = require('../queue/publisher');
// const { image2text } = require('../utils/ocr');
//
// async function processOCRMessage(message) {
//   try {
//     const { filePath, fileName } = message;
//     const text = await image2text(filePath);
//
//     if (text) {
//       const outputMessage = { text, outputFilePath: `${fileName}.pdf` };
//
//       // Gửi văn bản OCR đến hàng đợi translateQueue
//       await publishMessage('translateQueue', outputMessage);
//       console.log('OCR text sent to translateQueue:', outputMessage);
//     } else {
//       console.error('No text extracted from image.');
//     }
//   } catch (error) {
//     console.error('Error processing OCR message:', error);
//   }
// }
//
// function startOCRFilter() {
//   consumeMessage('imageQueue', processOCRMessage);
// }
//
// module.exports = { startOCRFilter };