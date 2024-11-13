const amqp = require('amqplib')
const path = require('path')

async function publish(queue, message) {
    try {
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.createChannel()

        await channel.assertQueue(queue, { durable: true })
 
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true
        })

        console.log('Message to queue: ', message)
        
        setTimeout(() => {
            connection.close()
        }, 500)
    } catch (error) {
        console.error('error publishing to queue: ', error)
    }
}

module.exports = { publish }