import { Component, OnInit, forwardRef, Output, EventEmitter, Input } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material';
import { LogicalOperator } from '../../models/models';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'logical-operator',
  templateUrl: './logical-operator.component.html',
  styleUrls: ['./logical-operator.component.css'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LogicalOperatorComponent),
      multi: true
    }    
  ],  
})
export class LogicalOperatorComponent implements OnInit, ControlValueAccessor  {

  @Input() hideRemove: boolean;
  @Output() addGroup: EventEmitter<any> = new EventEmitter();
  @Output() addCondition: EventEmitter<any> = new EventEmitter();
  @Output() remove: EventEmitter<any> = new EventEmitter();
  operator: LogicalOperator = LogicalOperator.And
  disable: boolean;
  propagateChange: (value: any) => void = (value: any) => {};

  constructor() { }

  ngOnInit() {
  }

  newCondition(): void {
    this.addCondition.emit();
  }

  newGroup(): void {
    this.addGroup.emit();
  }

  change(e: MatButtonToggleChange): void {
    this.operator = e.value;        
    this.propagateChange(e.value);
  }

  removeGroup(): void {
    this.remove.emit();
  }

  /* ControlValueAccessor implementation */

  writeValue(value: any): void {
    this.operator = value || LogicalOperator.And;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disable = isDisabled;
  }  

}
