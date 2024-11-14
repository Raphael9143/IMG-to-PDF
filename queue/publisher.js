const amqp = require('amqplib')

async function publishMessage(queue, message) {
    try {
        const connection = await amqp.connect('amqps://jorghvwp:GTvXw5g2jocKFsOINomyx3nfbmYgfLGZ@gerbil.rmq.cloudamqp.com/jorghvwp')
        const channel = await connection.createChannel()

        await channel.assertQueue(queue, { durable: true })
 
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
            persistent: true
        })

        console.log('Message to queue: ', message)
        await channel.close()
        await connection.close()
    } catch (error) {
        console.error('error publishing to queue: ', error)
    }
}

module.exports = { publishMessage }