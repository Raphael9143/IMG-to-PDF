const amqp = require('amqplib')

async function publishMessage(queue, message) {
    const connection = await amqp.connect('amqps://jorghvwp:GTvXw5g2jocKFsOINomyx3nfbmYgfLGZ@gerbil.rmq.cloudamqp.com/jorghvwp')
    const channel = await connection.createChannel()
    try {
        await channel.assertQueue(queue, { durable: true })

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true
        })
    } catch (error) {
        console.error('error publishing to queue: ', error)
    } finally {
        await channel.close()
        await connection.close()
        console.log('Channel and Connection closed.')
    }
}

module.exports = { publishMessage }