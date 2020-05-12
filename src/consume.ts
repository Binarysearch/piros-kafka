
import 'reflect-metadata';
import { Type } from '@piros/ioc';

export const CONSUMERS: Set<ConsumerMapping> = new Set();
export const CONTROLLERS: Map<Object, Type<any>> = new Map();

export type DoneFunc = (cb?: (error: any, data: any) => void) => void;

export interface Message<T> {
    topic: string;
    value: T;
    offset?: number;
    partition?: number;
    highWaterOffset?: number;
    key?: string | Buffer;
}

export interface ConsumerMapping {
    controller: Object;
    host: string;
    topic: string;
    groupId: string;
    method: Function;
}

export function KafkaController() {
    return function <U extends Type<any>>(constructor: U) {

        CONTROLLERS.set(constructor.prototype, constructor);

        return constructor;
    }
}

export function Consume(host: string, topic: string, groupId: string) {
    return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor) {

        const consumerMapping: ConsumerMapping = {
            controller: target,
            host: host,
            topic: topic,
            groupId: groupId,
            method: descriptor.value
        };

        CONSUMERS.add(consumerMapping);

        return descriptor;
    };
}