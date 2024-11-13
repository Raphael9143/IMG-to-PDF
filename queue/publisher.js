const amqp = require('amqplib')
const path = require('path')

async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.channel

        const queue = 'imageProcessingQueue'
        await channel.assertQueue(queue, { durable: true })

        return { connection, channel, queue }
    } catch (error) {
        console.log("Error while connecting to RabbitMQ: ", error)
    }
}

async function sendToQueue(message) {
    const { connection, channel, queue } = await connectToRabbitMQ()

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true
    })

    console.log('Message to queue: ', message)
    
    setTimeout(() => {
        connection.close()
    }, 500)
}

module.exports = { sendToQueue }