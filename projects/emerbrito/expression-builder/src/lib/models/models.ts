import { ValidatorFn } from '@angular/forms';
import { Type } from '@angular/core';
import { Observable } from 'rxjs';

export enum FieldType {
    Boolean = 'bool',
    Date = 'date',
    Lookup = 'lookup',
    Number = 'number',
    Text = 'text',
}

export enum ConditionOperator {
    Equals = 'eq',
    NotEquals = 'ne',
    GreaterThan = 'gt',
    GreaterEqual = 'ge',
    LessThan = 'lt',
    LessEqual = 'le',
    Contains = 'contains'    
}

export interface ExpressionChangeEvent {
    valid: boolean,
    expression: QueryExpression
}

export enum LogicalOperator {
    And = 'and',
    Or = 'or'
}

export interface Field {
    label: string,
    name: string,    
    type: FieldType,
    values?: OptionValue[],
    lookup?: LookupSettings
}

export interface LookupSettings {
    valueField: string,
    textField: string,
    service: Type<LookupService>
} 

export interface LookupService {
    data: Observable<any>;
    loading: boolean;

    error: (err: any) => void;
    search: (value: string) => void;
}

export interface FieldTypeOperators {
    type: FieldType | string,
    operators: ConditionOperator[],
    validators?: ValidatorFn[] // for internal use
}

export interface ConditionExpression {
    fieldName: string,
    condition: ConditionOperator,
    value: any
}

export interface QueryExpression {
    operator: LogicalOperator,
    rules: (ConditionExpression|QueryExpression)[];
}

export interface OptionValue {
    value: any,
    label: string
}

export interface KeyValuePair<T> {
    key: string,
    value: T
}

export class KeyValueCollection<T> {

    private items:KeyValuePair<T>[] = [];
    
    add(key: string, value: T): void {
        this[key] = value;
        this.items.push({ key: key, value: value });        
    }

    addItem(item: KeyValuePair<T>): void {
        this[item.key] = item.value;
        this.items.push(item);
    }

    getItems(): KeyValuePair<T>[] {
        return this.items;
    }

    hasKey(key: string): boolean {
        return Object.hasOwnProperty.call(this, key);
    }

    value(key: string): T {
        let value = null;

        if(key) {
            value = this[key];
        }        

        return value;
    }    

}
