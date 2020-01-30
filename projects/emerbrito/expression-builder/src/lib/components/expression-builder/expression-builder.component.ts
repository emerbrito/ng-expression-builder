import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { ExpressionService } from '../../services/expression.service';
import { QueryExpression, Field, LogicalOperator, ExpressionChangeEvent } from '../../models/models';

@Component({
  selector: 'expression-builder',
  templateUrl: './expression-builder.component.html',
  styleUrls: ['./expression-builder.component.scss'],
  providers: [ExpressionService]
})
export class ExpressionBuilderComponent implements OnInit, OnChanges {
  
  @Input() data: QueryExpression;
  @Input() fields: Field[] = [];
  @Output() valuechange: EventEmitter<ExpressionChangeEvent> = new EventEmitter;
  invalid: boolean = false;
  valid: boolean = true;  
  form: FormGroup;  
  formValueSubs: Subscription;

  get valueChanges(): Observable<any> {
    return this.form.valueChanges;
  }

  get value(): Observable<any> {
    return this.form.value;
  }

  constructor(
    private expService: ExpressionService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    
    this.expService.setFields(this.fields);    
    this.initialize();
    this.subscribeToForm();    
         
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    const dataInput: SimpleChange = changes.data;

    if(dataInput) {
      
      if(this.formValueSubs) {
        this.formValueSubs.unsubscribe();
      }
      this.initialize();
      this.subscribeToForm();
      this.emitChanges();
    }

  }  

  addCondition(host: FormGroup): void {

    let rules = host.get('rules') as FormArray;
    let msg = 'Method addCondition() failed.';

    if(!rules) {
      throw new Error(`${msg} Form control  doesn't have a property called 'rules'.`);
    }

    if(rules instanceof FormArray === false) {
      throw new Error(`${msg} Control 'rules' is not a FormArray.`);
    }
    
    rules.push(this.expService.createCondition('', null, ''));

  }

  addGroup(host: FormGroup): void {

    let rules = host.get('rules') as FormArray;
    let msg = 'Method addGroup() failed.';

    if(!rules) {
      throw new Error(`${msg} Form control  doesn't have a property called 'rules'.`);
    }

    if(rules instanceof FormArray === false) {
      throw new Error(`${msg} Control 'rules' is not a FormArray.`);
    }
    
    rules.push(this.expService.createGroup(LogicalOperator.And));

  }  

  emitChanges(): void {
    this.valuechange.emit({
      valid: this.form.valid,
      expression: this.form.value
    });    
  }

  extractRules(formGroup: FormGroup): AbstractControl[] {
    let result: AbstractControl[] = []

    if(formGroup) {
      let rules = formGroup.get('rules') as FormArray;

      if(rules && rules.controls && rules.controls.length > 0) {
        result = rules.controls;
      }
    }

    return result;
  }

  initialize(): void {

    if(this.data && this.expService.validate(this.data)) {
      this.form = this.expService.toFormGroup(this.data);     
    } else {
      console.log('not valid');
      this.form = this.fb.group({
        operator: [LogicalOperator.And],
        rules: this.fb.array([])
      });

    }  

  }

  isCondition(value: AbstractControl): boolean {
    return value.get('fieldName') != null;
  }

  isGroup(value: AbstractControl): boolean {
    return value.get('rules') != null;
  }

  isFirstCondition(index: number, rules: FormArray): boolean {    

    let firstCondIndex = -1;
        
    for(let i = 0; i < rules.length; i++) {
      if(this.isCondition(rules[i])) {
        firstCondIndex = i;
        break;
      }
    }

    return index === firstCondIndex;

  }

  isLastCondition(index: number, rules: FormArray): boolean {    

    if(index >= (rules.length - 1)) {
      return true;
    }

    let result = false;
        
    for(let i = (index + 1); i < rules.length; i++) {
      result = this.isGroup(rules[i]);
      if(!result) {
        break;
      }
    }

    return result;

  }

  removeItem(index: number, parent: FormGroup): void {

    if(!parent) {
      return;
    }

    let rules = parent.get('rules') as FormArray;
    let msg = 'Method removeGroup() failed.';

    if(!rules) {
      throw new Error(`${msg} Form control doesn't have a property called 'rules'.`);
    }

    if(rules instanceof FormArray === false) {
      throw new Error(`${msg} Control 'rules' is not a FormArray.`);
    }

    rules.removeAt(index);

  }

  subscribeToForm(): void {
    this.formValueSubs = this.form.valueChanges.subscribe(data => {
      this.valid = this.form.valid;
      this.invalid = this.form.invalid;
      this.emitChanges();
    })     
  }

  validateField(control: AbstractControl) {
    let value = control && control.value ? control.value : '';
    let results = this.fields.filter(field => field.name === value);

    return results.length > 0;
  }  


}
