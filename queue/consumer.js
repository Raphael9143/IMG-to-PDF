const amqp = require('amqplib')
const { image2text } = require('../utils/ocr')
const { createPDF } = require('../utils/pdf')
const { translate } = require('../utils/translate')
const path = require('path')

async function start() {
    try {
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.createChannel()

        const queue = 'image_processing'
        await channel.assertQueue(queue, { durable: true })

        return { channel, queue }
    } catch (error) {
        console.error("Error connecting to Rabbit MQ: ", error)
    }
}

async function processMessage(channel, msg) {
    try {
        const data = JSON.parse(msg.content.toString())

        const text = await image2text(data.filePath)
        const translatedText = translate(text)
        const pdfPath = createPDF(translatedText, data.fileName)

        console.log(pdfPath)

        console.log(`PDF created at: ${pdfPath}`)

        channel.ack(msg)
    } catch (error) {
        console.error("Error sending messages to queue: ", error)
    }
}

async function listenToQueue() {
    const { channel, queue } = start()

    channel.consume(queue, async (msg) => {
        if (msg != null) {
            await processMessage(channel, msg)
        }
    })
}

module.exports = { listenToQueue }