import { Injectable } from '@angular/core';
import { FieldTypeOperators, FieldType, ConditionOperator, Field, OptionValue, KeyValueCollection, LogicalOperator } from '../models/models';
import { FormGroup, FormBuilder, FormArray, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ConditionLabels } from '../models/labels';
import { typeSourceSpan } from '@angular/compiler';
import { QueryExpression, ConditionExpression } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ExpressionService {

  private _typeOperators: KeyValueCollection<OptionValue[]> = new KeyValueCollection<OptionValue[]>();  
  private _types: KeyValueCollection<FieldTypeOperators>;
  private _fields: KeyValueCollection<Field>;
  private _labels: KeyValueCollection<string>;  

  get fields(): KeyValueCollection<Field> {   
    return this._fields;
  }  

  get labels(): KeyValueCollection<string> {

    if(this._labels) {
      return this._labels;
    }

    this.initLabels();
    return this._labels;
  }
  
  get types(): KeyValueCollection<FieldTypeOperators> {

    if(this._types) {
      return this._types;
    }

    this.initTypes();
    return this._types;
  }

  constructor(private fb: FormBuilder) { }

  fieldByLabel(fieldLabel: string): Field {

    if(!this._fields || !fieldLabel) {
      return null;
    }

    let item: Field = null;
    let items = this._fields.getItems();
    let filteredItems = items.filter(item => item.value.label.toLowerCase() === fieldLabel.toLowerCase());

    if(filteredItems.length > 0) {
      item = filteredItems[0].value;
    }

    return item;
  }

  fieldLabel(fieldName: string): string {

    if(this._fields) {
      let options = this.fieldOptions(fieldName);

      if(options) {
        return options.label;
      }      
    }

    return '';
  }

  fieldOptions(fieldName: string): Field {

    if(this._fields) {
      return this._fields.value(fieldName);
    }

    return null;    
  }

  operatorsByType(type: FieldType): OptionValue[] {

    if(this._typeOperators.hasKey(type)) {
      return this._typeOperators.value(type);
    }
    
    let values: OptionValue[] = [];
    let typeInfo = this.types.value(type);

    if(typeInfo){

      typeInfo.operators.forEach(item => {
        values.push({
          value: item,
          label: ConditionLabels[item]
        })
      });      

      this._typeOperators.add(type, values);

    }    

    return values;
  }

  optionSetOperators(): OptionValue[] {
    let values: OptionValue[] = [
      { value: ConditionOperator.Equals, label: ConditionLabels[ConditionOperator.Equals]},
      { value: ConditionOperator.NotEquals, label: ConditionLabels[ConditionOperator.NotEquals]},
      { value: ConditionOperator.Contains, label: ConditionLabels[ConditionOperator.Contains]},
      { value: ConditionOperator.Null, label: ConditionLabels[ConditionOperator.Null]},
      { value: ConditionOperator.NotNull, label: ConditionLabels[ConditionOperator.NotNull]},
    ];

    return values;
  }

  setFields(fields: Field[]): void {

    this._fields = new KeyValueCollection<Field>();

    if(fields) {
      fields.forEach(field => {
        this._fields.add(field.name, field)
      });
    }

  }

  toFormGroup(expression: QueryExpression): FormGroup {

    if(!expression) {
      return null;
    }

    let group: FormGroup = this.createGroup(expression.operator);
    let rules = group.get('rules') as FormArray;

    for(let i = 0; i < expression.rules.length; i++) {

      let item = expression.rules[i];

      if(this.isCondition(item)) {
        let c = item as ConditionExpression;
        rules.push(this.createCondition(c.fieldName, c.condition, c.value));
      }
      else if(this.isGroup(item)) {
        
        let g = item as QueryExpression;
        rules.push(this.toFormGroup(g));

      }

    }

    return group;    

  }

  typeOptions(type: FieldType): FieldTypeOperators {
    return this.types.value(type);
  }

  validate(expression: QueryExpression): boolean {

    if(!expression) {
      return false;
    }

    if(!expression.operator) {
      return false;
    }

    if(!expression.rules) {
      return false;
    }

    for(let i = 0; i < expression.rules.length; i++) {

      let item = expression.rules[i];

      if(this.isCondition(item)) {
        let c = item as ConditionExpression;
        if(!c.fieldName || !c.condition) {
          return false;
        }
      }
      else if(this.isGroup(item)) {
        
        let g = item as QueryExpression;
        if(!g.operator || !g.rules) {
          return false;
        }   
        this.validate(g);
      }
      else {
        return false;
      }

    }

    return true;
  }

  validadorsByType(type: FieldType): ValidatorFn[] {

    let fieldType = this.types.value(type);
    let validators: ValidatorFn[] = null;

    if(fieldType) {
      validators = fieldType.validators;
      
      if(validators && validators.length === 0){
        validators = null;
      }
      
    }
    
    return validators;
  }  

  public createGroup(operator: LogicalOperator): FormGroup {
    return this.fb.group({
      operator: [operator],
      rules: this.fb.array([])
    });
  }  

  public createCondition(fieldName?: string, condition?: ConditionOperator, value?: any): FormGroup {    
    return this.fb.group({
      fieldName: [fieldName, [Validators.required, this.validateField.bind(this)]],
      condition: [{value: condition, disabled: true}, [Validators.required]],
      value: [value, [Validators.required]]
    });    
  }  

  private initLabels(): void {

    this._labels = new KeyValueCollection<string>()

    for (const prop in ConditionLabels) {
      if (ConditionLabels.hasOwnProperty(prop)) {
        const element = ConditionLabels[prop];
        this._labels.add(prop, element);
      }
    }    

  }

  private initTypes(): void {

    this._types = new KeyValueCollection<FieldTypeOperators>();

    this._types.add(FieldType.Boolean, { 
      type: FieldType.Boolean, 
      operators: [
        ConditionOperator.Equals,
        ConditionOperator.NotEquals,
        ConditionOperator.Null,
        ConditionOperator.NotNull
      ],
      validators: [Validators.required, Validators.pattern('^(true|false|1|0)$')]
    });    

    this._types.add(FieldType.Date, { 
      type: FieldType.Date, 
      operators: [
        ConditionOperator.Equals,
        ConditionOperator.GreaterEqual,
        ConditionOperator.GreaterThan,
        ConditionOperator.LessEqual,
        ConditionOperator.LessThan,
        ConditionOperator.NotEquals,
        ConditionOperator.Null,
        ConditionOperator.NotNull        
      ],
      validators: [Validators.required]
    });

    this._types.add(FieldType.Lookup, { 
      type: FieldType.Lookup, 
      operators: [
        ConditionOperator.Equals,
        ConditionOperator.NotEquals,
        ConditionOperator.Null,
        ConditionOperator.NotNull        
      ],
      validators: [Validators.required]
    });      

    this._types.add(FieldType.Number, { 
      type: FieldType.Date, 
      operators: [
        ConditionOperator.Equals,
        ConditionOperator.GreaterEqual,
        ConditionOperator.GreaterThan,
        ConditionOperator.LessEqual,
        ConditionOperator.LessThan,
        ConditionOperator.NotEquals,
        ConditionOperator.Null,
        ConditionOperator.NotNull        
      ],
      validators: [Validators.required, Validators.pattern('^((\-?)([0-9]*)|(\-?)(([0-9]*)\.([0-9]*)))$')]
    });     

    this._types.add(FieldType.Text, { 
      type: FieldType.Date, 
      operators: [
        ConditionOperator.Contains,
        ConditionOperator.Equals,
        ConditionOperator.NotEquals,
        ConditionOperator.Null,
        ConditionOperator.NotNull        
      ],
      validators: [Validators.required]
    });  
    
  }   
  
  public isCondition(value: ConditionExpression | QueryExpression): boolean {

    if(!value) {
      return false;
    }

    let item = value as ConditionExpression;    
    return item.hasOwnProperty('fieldName') && item.hasOwnProperty('condition');
  }

  public isGroup(value: ConditionExpression | QueryExpression): boolean {

    if(!value) {
      return false;
    }

    let item = value as QueryExpression;    
    return item.hasOwnProperty('operator') && item.hasOwnProperty('rules');
  }  

  validateField(control: AbstractControl) {
    let value = control && control.value ? control.value : '';
    let result = this.fields.value(value);

    return result != null;
  }    

}
