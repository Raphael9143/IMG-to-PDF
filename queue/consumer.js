const amqp = require('amqplib')
const path = require('path')

async function consumeMessage(queue, callback) {
    return new Promise(async (resolve, reject) => {
        try {
            const connection = await amqp.connect('amqp://localhost')
            const channel = await connection.createChannel()    
            await channel.assertQueue(queue, { durable: true })
    
            channel.prefetch(1)
    
            channel.consume(queue, async (msg) => {
                if (msg) {
                    const message = JSON.parse(msg.content.toString());
                    try {
                        await callback(message);
                        channel.ack(msg);  // Acknowledge message on successful processing
                    } catch (error) {
                        console.error(`Error processing message from queue ${queue}:`, error);
                        channel.nack(msg);  // Reject message and requeue in case of failure
                    }
                }
            });
    
        } catch (error) {
            console.error(`Error connecting to RabbitMQ for queue ${queue}:`, error);
        }
    })
}

module.exports = { consumeMessage }