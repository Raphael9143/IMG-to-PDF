const amqp = require('amqplib')
const { image2text } = require('../utils/ocr')
const { createPDF } = require('../utils/pdf')
const { translate } = require('../utils/translate')
const path = require('path')

async function consumeMessage() {
    return new Promise(async (resolve, reject) => {
        try {
            const connection = await amqp.connect('amqps://jorghvwp:GTvXw5g2jocKFsOINomyx3nfbmYgfLGZ@gerbil.rmq.cloudamqp.com/jorghvwp')
            const channel = await connection.createChannel()
            console.log("successfully connected")
    
            const queue = 'image_processing'
            await channel.assertQueue(queue, { durable: true })
    
            channel.prefetch(1)
    
            channel.consume(queue, async(msg) => {
                if (msg != null) {
                    const { fileName, filePath } = JSON.parse(msg.content.toString())
                    try {
                        const text = await image2text(filePath)
                        const translatedText = await translate(text)
                        const pdfPath = await createPDF(translatedText, fileName)
                        
                        channel.ack(msg)
    
                        console.log(pdfPath)
    
                        resolve(pdfPath)
                    } catch (error) {
                        console.error('Error consuming messages: ', error)
                        reject(error)
                    }
                }
            })
    
        } catch (error) {
            console.error("Error connecting to Rabbit MQ: ", error)
            reject(error)
        }
    })
}

module.exports = { consumeMessage }