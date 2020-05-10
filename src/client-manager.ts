import { Injectable } from "@piros/ioc";
import { KafkaClient } from "kafka-node";

@Injectable
export class ClientManager {

    private clients: Map<string, KafkaClient> = new Map();

    public getClient(host: string): KafkaClient {
        let client = this.clients.get(host);
        if (!client) {
            client = new KafkaClient({
                kafkaHost: host
            });
            this.clients.set(host, client);
        }

        return client;
    }

}