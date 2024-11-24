const amqp = require('amqplib')

async function publishMessage(queue, message) {
    try {
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.createChannel()

        await channel.assertQueue(queue, { durable: true })
 
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true
        })

        await channel.close()
        await connection.close()
    } catch (error) {
        console.error('error publishing to queue: ', error)
    }
}

module.exports = { publishMessage }