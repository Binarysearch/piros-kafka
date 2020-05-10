import { Injectable } from "@piros/ioc";
import { ClientManager } from "./client-manager";
import { Observable } from "rxjs";
import { KafkaClient, Producer } from "kafka-node";

@Injectable
export class KafkaProducerManager {

    constructor(
        private clientManager: ClientManager
    ) { }

    public getProducer(host: string): Observable<KafkaProducer> {

        return new Observable(observer => {

            const client = this.clientManager.getClient(host);
            const producer = new Producer(client);

            producer.on('ready', () => {
                observer.next(new KafkaProducer(producer));
                observer.complete();
            });

            producer.on('error', (err) => {
                observer.error(err);
                console.error(err);
            });
        });
        
    }

}

export class KafkaProducer {

    constructor(private producer: Producer) {}

    send(topic: string, message: string, partition?: number): Observable<any> {
        return new Observable(observer => {
            const payload = (partition !== undefined && partition !== null) 
                ? { topic: topic, messages: message, partition: partition } 
                : { topic: topic, messages: message } ;
            
            this.producer.send([payload], (err, data) => {
                if (err) {
                    observer.error(err);
                } else {
                    observer.next(data);
                    observer.complete();
                }
            });
            
        });
    }
}
