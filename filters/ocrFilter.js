const { Worker } = require('worker_threads');
const { consumeMessage } = require('../queue/consumer');
const path = require('path');

const workers = [];
const maxThreads = 4;
let availableWorkers = [];

function startOCRFilter() {

    // Tạo worker pool với số lượng worker là maxThreads
    for (let i = 0; i < maxThreads; i++) {
        const worker = new Worker(path.resolve(__dirname, '../worker/ocrWorker.js'));
        workers.push(worker);
        availableWorkers.push(worker);

        worker.on('message', (message) => {
            if (message === 'ready') {
                // Đưa worker vào danh sách worker rảnh
                availableWorkers.push(worker);
                checkQueue();
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

    consumeMessage('imageQueue', (message) => {
        if (availableWorkers.length > 0) {

            // Lấy worker rảnh và gửi message đến worker
            const worker = availableWorkers.pop();
            worker.postMessage(message);
        } else {
            // Nếu không có worker rảnh thì thử lại sau 1 giây
            setTimeout(() => consumeMessage('imageQueue', (msg) => worker.postMessage(msg)), 1000);
        }
    });

    console.log('OCR filter started with competing consumers.');
}

// Kiểm tra hàng đợi và gửi message đến worker nếu có worker trống
function checkQueue() {
    if (availableWorkers.length > 0) {
        consumeMessage('imageQueue', (message) => {
            if (message) {
                const worker = availableWorkers.pop();// Lấy worker rảnh
                worker.postMessage(message);// Gửi message đến worker
            }
        });
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