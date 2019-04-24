import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ViewChild, Injector } from '@angular/core';
import { FormGroup, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { ExpressionService } from '../../services/expression.service';
import { Field, OptionValue, ConditionOperator, FieldTypeOperators, LookupService, FieldType } from '../../models/models';
import { FieldSelectComponent } from '../field-select/field-select.component';
import { MatAutocompleteTrigger } from '@angular/material';
import { first } from 'rxjs/operators';

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
  @ViewChild('lookupinput',  { read: MatAutocompleteTrigger }) lookupInput: MatAutocompleteTrigger;
  operators: OptionValue[] = [];
  fieldSubs: Subscription;
  valueSubs: Subscription;
  lookupService: LookupService;  

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
    private expService: ExpressionService,
    private injector: Injector
  ) 
  { 
    this.lookupDisplay = this.lookupDisplay.bind(this);
  }  

  ngOnInit() {

    this.fieldSubs = this.field.valueChanges
      .subscribe(value => this.fieldChange(value));

    this.valueSubs = this.value.valueChanges
      .subscribe(value => this.valueChange(value));          

    if(this.fieldOptions) {
      this.operatorFilter(this.fieldOptions);
    }

    if(this.field && !this.field.value || this.field.invalid) {
      if(this.value) {
        this.value.disable();
      }
    }    

    this.initLookup();

  }

  ngOnDestroy() {
    if(this.fieldSubs) this.fieldSubs.unsubscribe();
    if(this.valueSubs) this.valueSubs.unsubscribe();
  }

  clearLookup(): void {

    if(this.value) {
      this.value.setValue('');
    }

    if(this.lookupService) {
      this.lookupService.search('');
    }

    // if(this.lookupInput) {
    //   ;
    // }
  }

  fieldChange(fieldName: string): void {

    let field = this.expService.fieldOptions(fieldName);
    
    this.condition.setValue('');
    this.value.setValue('');   

    if(field) {
      const validators = this.expService.validadorsByType(field.type);
      if(field.type === FieldType.Lookup) {
        validators.push(this.lookupValidator(field.lookup.textField, field.lookup.valueField));
      }
      this.value.setValidators(validators)      
    }    
    else {
      this.value.setValidators(null);
    } 
        
    if(this.field.value && this.field.valid) {
      this.value.enable();
    }
    else {
      this.value.setValue(null);
      this.value.disable();
    }     

    this.initLookup();
    this.operatorFilter(field);
  }

  initLookup(): void {

    if(this.fieldOptions && this.fieldOptions.lookup && this.fieldOptions.lookup.service) {
      this.lookupService = this.injector.get(this.fieldOptions.lookup.service);
      this.lookupService.search('');
    }
    else {
      this.lookupService = null;
    }        
  }

  lookupDisplay(value: any): string | undefined {

    let label: string;

    if(this.fieldOptions && this.fieldOptions.lookup) {
      label = value[this.fieldOptions.lookup.textField];
    }    
    return label || undefined;
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

  lookupValidator(textField: string, valueField: string): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;

      if(
          value && 
          ((typeof value === 'string') ||
          (!value.hasOwnProperty(textField) || !value.hasOwnProperty(valueField)))
        ) {
        return { 'LookupInvalidOption' : {value: control.value} }
      }

      return null;
    };
  }     
   
  operatorDisplayFn(operator: ConditionOperator): string {

    let name: string = '';
    let result = this.operators.filter(item => item.value === operator);

    if(result && result.length > 0) {
      name = result[0].label;
    }

    return name;
  }  

  valueChange(value: any): void {

    let filter: string = '';

    if(typeof value === 'string') {
      filter = value;
    }
    else if(this.fieldOptions && this.fieldOptions.lookup){      
      filter = value[this.fieldOptions.lookup.textField];
    }

    if(this.lookupService) {
      this.lookupService.search(filter);
    }
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
      else if (this.fieldOptions.type && this.fieldOptions.type === FieldType.Lookup) {
        name = 'lookup'
      }      
      else {
        name = this.fieldOptions.type;       
      }
    }

    return name;
  }
}
