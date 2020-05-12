import { Consumer } from 'kafka-node';
import { CONTROLLERS, CONSUMERS, Message } from './consume';
import { Injector } from '@piros/ioc';
import { ClientManager } from './client-manager';

export function connectKafka(injector: Injector): void {

    const clientManager = injector.resolve(ClientManager);

    CONSUMERS.forEach(c => {
    
        const client = clientManager.getClient(c.host);

        const constructor = CONTROLLERS.get(c.controller);
        const controller = injector.resolve(constructor);
    
        const consumer = new Consumer(client, [
            {
                topic: c.topic
            }
        ], {
          groupId: c.groupId,
          autoCommit: false
        });
        
        const method = c.method.bind(controller);
    
        consumer.on('message', (kafkaMessage) => {
            const message: Message<any> = {
                topic: kafkaMessage.topic,
                offset: kafkaMessage.offset,
                partition: kafkaMessage.partition,
                highWaterOffset: kafkaMessage.highWaterOffset,
                key: kafkaMessage.key,
                value: JSON.parse(kafkaMessage.value.toString())
            }

            method(message, (cb) => {
                setTimeout(() => {
                    if (cb) {
                        consumer.commit(cb);
                    } else {
                        consumer.commit(() => {});
                    }
                }, 0);
            });
        });
    });
}