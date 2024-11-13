const amqp = require('amqplib')
const { image2text } = require('../utils/ocr')
const { createPDF } = require('../utils/pdf')
const { translate } = require('../utils/translate')
const path = require('path')
const fs = require('fs')

async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.channel

        const queue = 'imageProcessingQueue'
        await channel.assertQueue(queue, { durable: true })

        return { connection, channel, queue }
    } catch (error) {
        console.error("Error connecting to Rabbit MQ: ", error)
    }
}

async function processMessage(msg) {
    try {
        const { fileName, filePath } = JSON.parse(msg.content.toString())
        console.log(`Processing file: ${fileName}`)

        const text = await image2text(filePath)
        const translatedText = translate(text)
        const pdfPath = createPDF(translatedText)

        console.log(`PDF created at: ${pdfPath}`)

        msg.channel.ack(msg)
    } catch (error) {
        console.error("Error sending messages to queue: ", error)
    }
}

async function listenToQueue() {
    const { connection, channel, queue } = connectToRabbitMQ()

    channel.consume(queue, async (msg) => {
        if (msg != null) {
            await processMessage(msg)
        }
    })
}

module.exports = { listenToQueue }