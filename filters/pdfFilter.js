const { consumeMessage } = require('../queue/consumer');


const path = require('path');
const {Worker} = require('worker_threads');

const workers = [];
const maxThreads = 4;
let availableWorkers = [];

function startPDFFilter(){
    for (let i = 0; i < maxThreads; i++) {
        const worker = new Worker(path.resolve(__dirname, '../worker/pdfWorker.js'));

        workers.push(worker);
        availableWorkers.push(worker);

        worker.on('message', (message) => {
            if (message === 'ready') {
                availableWorkers.push(worker);
                checkQueue();
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
}

function checkQueue() {
    if (availableWorkers.length > 0) {
        consumeMessage('pdfQueue', (message) => {
            if (message) {
                const worker = availableWorkers.pop();
                worker.postMessage(message);
            }
        });
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