import { KafkaController, Consume, Message, DoneFunc } from './consume';
import { Injectable } from '@piros/ioc';
import { connectKafka } from './application';

@Injectable
class A {

    prueba(): string {
        return 'a';
    }
}


@KafkaController()
export class Prueba {

    constructor(private a: A) {}

    @Consume('localhost:9092', 'test', 'grupo-1')
    public consume(message: Message, done: DoneFunc): void {
        console.log('a', this.a.prueba());
        console.log('message', message);
        done((err, data) => {
            console.log('commited');
        });
    }

}


connectKafka();