const { consumeMessage } = require('../queue/consumer');
const path = require('path');
const { Worker } = require('worker_threads');

const workers = [];
const maxThreads = 2;
let availableWorkers = [];
let messageQueue = [];

function startPDFFilter() {
    for (let i = 0; i < maxThreads; i++) {
        const worker = new Worker(path.resolve(__dirname, '../worker/pdfWorker.js'));

        workers.push(worker);
        availableWorkers.push(worker);

        worker.on('message', (message) => {
            if (message === 'ready') {
                availableWorkers.push(worker);
                processQueue();
            } else {
                console.log('PDF processing result:', message);
                availableWorkers.push(worker);
                processQueue();
            }
        });

        worker.on('error', (error) => {
            console.error(error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    }

    // Continuously consume messages from the queue
    consumeMessage('pdfQueue', handleMessage);
    console.log('PDF filter started with competing consumers.');
}

function handleMessage(message) {
    if (availableWorkers.length > 0) {
        const worker = availableWorkers.pop();
        worker.postMessage(message);
    } else {
        messageQueue.push(message);
    }
    // Continuously consume messages
    consumeMessage('pdfQueue', handleMessage);
}

function processQueue() {
    while (availableWorkers.length > 0 && messageQueue.length > 0) {
        const worker = availableWorkers.pop();
        const message = messageQueue.shift();
        worker.postMessage(message);
    }
}

module.exports = { startPDFFilter };

// async function processPDFMessage(message) {
//     try {
//         const outputFilePath = await createPDF(message.viText, message.outputFilePath);
//         console.log(`PDF created successfully at: ${outputFilePath}`);
//
//     } catch (error) {
//         console.error('Error creating PDF:', error);
//     }
// }
//
// function startPDFFilter() {
//     consumeMessage('pdfQueue', processPDFMessage);
// }
  
//module.exports = { startPDFFilter };