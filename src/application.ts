import { Consumer } from 'kafka-node';
import { CONTROLLERS, CONSUMERS } from './consume';
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
    
        consumer.on('message', (message) => {
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