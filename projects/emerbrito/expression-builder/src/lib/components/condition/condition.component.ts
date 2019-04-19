import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ExpressionService } from '../../services/expression.service';
import { Field, OptionValue, ConditionOperator, FieldType } from '../../models/models';
import { FieldSelectComponent } from '../field-select/field-select.component';
import { FieldTypeOperators } from '../../models/models';

@Component({
  selector: 'condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.css']
})
export class ConditionComponent implements OnInit, OnDestroy {
  
  @Input() allFields: Field[];
  @Input() formGroup: FormGroup;
  @Output() remove: EventEmitter<any> = new EventEmitter();
  @ViewChild('fieldSelector') fieldSelector: FieldSelectComponent;
  operators: OptionValue[] = [];
  fieldSubs: Subscription;

  get field(): FormControl {
    return this.formGroup.get('fieldName') as FormControl;
  }

  get fieldName(): string {
    return this.field.value;
  }

  get fieldOptions(): Field {
    return this.expService.fields.value(this.fieldName);
  }

  get typeOptions(): FieldTypeOperators {
    if(this.fieldOptions) {
      return this.expService.typeOptions(this.fieldOptions.type);
    }
    return null;
  }

  get condition(): FormControl {
    return this.formGroup.get('condition') as FormControl;
  } 
  
  get value(): FormControl {
    return this.formGroup.get('value') as FormControl;
  }   

  constructor(
    private expService: ExpressionService
  ) { }  

  ngOnInit() {

    this.fieldSubs = this.field.valueChanges
        .subscribe(value => this.fieldChange(value));

    if(this.fieldOptions) {
      this.operatorFilter(this.fieldOptions);
    }

  }

  ngOnDestroy() {
    if(this.fieldSubs) this.fieldSubs.unsubscribe();
  }

  fieldChange(fieldName: string): void {

    let field = this.expService.fieldOptions(fieldName);
    
    this.condition.setValue('');
    this.value.setValue('');   

    if(field) {
      this.value.setValidators(this.expService.validadorsByType(field.type))
    }    
    else {
      this.value.setValidators(null);
    }

    this.operatorFilter(field);
  }

  operatorFilter(fieldOptions: Field): void {
    this.operators = [];

    if(fieldOptions) {
      if(fieldOptions.values && fieldOptions.values.length > 0) {
        this.operators = this.expService.optionSetOperators();
      }
      else {
        this.operators = this.expService.operatorsByType(fieldOptions.type);
      }      
    }

    if(this.operators.length > 0) {
      this.condition.enable();
    }
    else {
      this.condition.disable();
    }       

  }
   
  operatorDisplayFn(operator: ConditionOperator): string {

    let name: string = '';
    let result = this.operators.filter(item => item.value === operator);

    if(result && result.length > 0) {
      name = result[0].label;
    }

    return name;
  }  

  removeCondition(): void {
    this.remove.emit();
  }
  
  valueControl(): string {

    let name: string = 'text';

    if(this.fieldOptions) {

      if(this.fieldOptions.values && this.fieldOptions.values.length > 0) {
        name = 'options'
      }
      else {
        name = this.fieldOptions.type;       
      }
    }

    return name;
  }
}
