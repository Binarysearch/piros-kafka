import { Consumer } from 'kafka-node';
import { CONTROLLERS, CONSUMERS } from './consume';
import { Injector } from '@piros/ioc';
import { ClientManager } from './client-manager';

export function connectKafka(): void {

    const clientManager = Injector.resolve(ClientManager);

    CONSUMERS.forEach(c => {
    
        const client = clientManager.getClient(c.host);

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