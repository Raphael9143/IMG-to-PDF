const { consumeMessage } = require('../queue/consumer');
const { Worker } = require('worker_threads');
const path = require('path');


const workers=[];
let availableWorkers = [];
const maxThreads = 4;

function startTranslateFilter(){
    for (let i = 0; i < maxThreads; i++) {
        const worker = new Worker(path.resolve(__dirname, '../worker/transWorker.js'));

        workers.push(worker);
        availableWorkers.push(worker);

        worker.on('message', (message) => {
            if (message ==='ready'){
                availableWorkers.push(worker);
                checkQueue();
            }
            else {
                console.log('Translate processing result:', message);
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
    consumeMessage('translateQueue', (message) => {
        if (availableWorkers.length > 0) {
            const worker = availableWorkers.pop();
            worker.postMessage(message);
        } else {
            setTimeout(() => consumeMessage('translateQueue', (msg) =>{
            if (availableWorkers.length > 0) {
                const worker = availableWorkers.pop();
                worker.postMessage(msg);
            }}), 1000);
        }
    });
    console.log('Translate filter started with competing consumers.');
}

function checkQueue() {
    if (availableWorkers.length > 0) {
        consumeMessage('translateQueue', (message) => {
            if (message) {
                const worker = availableWorkers.pop();
                worker.postMessage(message);
            }
        });
    }
}

module.exports = { startTranslateFilter };


// async function processTranslateMessage(message) {
//     try {
//         const viText = await translate(message.text);
//         const outputMessage = { viText, outputFilePath: message.outputFilePath };
//
//         // Gửi văn bản đã dịch đến pdfQueue để tạo PDF
//         await publishMessage('pdfQueue', outputMessage);
//         console.log('Translated text sent to pdfQueue:', outputMessage);
//     } catch (error) {
//         console.error('Error translating text:', error);
//     }
// }
//
// function startTranslateFilter() {
//     consumeMessage('translateQueue', processTranslateMessage);
// }
//
// module.exports = { startTranslateFilter };
