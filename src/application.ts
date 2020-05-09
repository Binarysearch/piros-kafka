import { KafkaClient, Consumer } from 'kafka-node';
import { CONTROLLERS, CONSUMERS } from './consume';
import { Injector } from '@piros/ioc';

export function startKafka(): void {

    const clients: Map<string, KafkaClient> = new Map();

    CONSUMERS.forEach(c => {
    
        let client = clients.get(c.host);
        if (!client) {
            client = new KafkaClient({
                kafkaHost: c.host
            });
            clients.set(c.host, client);
        }

        const constructor = CONTROLLERS.get(c.controller);
        const controller = Injector.resolve(constructor);
    
        const consumer = new Consumer(client, [
            {
                topic: c.topic
            }
        ], {
          groupId: c.groupId,
          autoCommit: false
        });
        
        const method = c.method.bind(controller);
    
        consumer.on('message', (message) => {
            method(message, (cb) => {
                setTimeout(() => {
                    consumer.commit(cb);
                }, 0);
            });
        });
    });
}