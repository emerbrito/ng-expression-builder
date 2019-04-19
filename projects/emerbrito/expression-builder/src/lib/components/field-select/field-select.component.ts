import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, HostBinding, Optional, Self, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { BehaviorSubject, Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatFormFieldControl, MatSelectChange } from '@angular/material';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

import { Field } from '../../models/models';
import { ExpressionService } from '../../services/expression.service';

@Component({
  selector: 'field-select',
  templateUrl: './field-select.component.html',
  styleUrls: ['./field-select.component.css'],
  providers: [{
    provide: MatFormFieldControl, 
    useExisting: FieldSelectComponent}
  ],  
})
export class FieldSelectComponent implements OnInit, OnDestroy, ControlValueAccessor, MatFormFieldControl<string> {

  private _disabled: boolean;

  @Input('fields') allFields: Field[];  
  @Output() fieldSelected: EventEmitter<string> = new EventEmitter();
  @ViewChild('input', {read: ElementRef}) private input: ElementRef;
  @ViewChild('selectTrigger') selectTrigger: MatAutocompleteTrigger;

  fielteredOptions: BehaviorSubject<Field[]> = new BehaviorSubject([]);
  inputValueChange: Subject<string> = new Subject();
  inputValueSubs: Subscription;
  inputValue: string = '';
  selectedFieldChange: Subject<Field> = new Subject();
  selectedFieldSubs: Subscription;
  selectedField: Field;

  @Input()
  get disabled(): boolean { 
    return this._disabled; 
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }   

  constructor(
    private expService: ExpressionService,
    private fm: FocusMonitor, private elRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl,    
  ) { 

    this.labelByValue = this.labelByValue.bind(this);

    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    fm.monitor(elRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;      
      this.stateChanges.next();
    });    

  }

  ngOnInit() {

    this.fielteredOptions.next(this.allFields);

    this.selectedFieldSubs = this.selectedFieldChange.subscribe(data => {
      this.selectedField = data;
      this.propagateChange(data ? data.name : '');
      this.errorState = this.ngControl ? this.ngControl.invalid : false;
    });

    this.inputValueSubs = this.inputValueChange
        .pipe(
          debounceTime(150)
        )
        .subscribe(data => {
          this.filterOptions(data);          
        });    

  }

  ngOnDestroy() {
    if(this.inputValueSubs) this.inputValueSubs.unsubscribe;
    if(this.selectedFieldSubs) this.selectedFieldSubs.unsubscribe;

    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);

    this.fielteredOptions.complete();
    this.inputValueChange.complete();
    this.selectedFieldChange.complete();
  }

  blur(inputValue: string): void {
    this.setFromLabel(inputValue);   

    if(this.ngControl) {
      this.errorState = this.ngControl.invalid;
    }
  }

  public clear(): void {
    this.setFromName('');
    this.filterOptions('');      
    this.input.nativeElement.value = '';  
    setTimeout(() => {
      this.selectTrigger.openPanel();
      this.input.nativeElement.focus()
    });
  }

  filterOptions(contains: string): void {
    
    if(contains) {
      let values = this.allFields.filter(item => item.label.toLowerCase().indexOf(contains.toLowerCase()) >= 0);
      this.fielteredOptions.next(values);
    }
    else {
      this.fielteredOptions.next(this.allFields);
    }

  }

  keyup(inputValue: string): void {
    this.inputValueChange.next(inputValue);
  }

  labelByValue(value: string): string {
    return this.expService.fieldLabel(value);
  }

  applyChange(value: Field): void {
    this.selectedFieldChange.next(value);
  }

  optionSelected(e: MatAutocompleteSelectedEvent): void {    
    this.setFromName(e.option.value);
    this.fieldSelected.emit(e.option.value);
  }

  setFromLabel(label: string): void {
    let option = this.expService.fieldByLabel(label);    

    if(!option && !this.selectedField) {
      return;
    }

    if((!option && this.selectedField) || (option && !this.selectedField)) {
      this.applyChange(option);
      return;      
    }

    if(option && option.name !== this.selectedField.name) {
      this.applyChange(option);
    }
    
  }

  setFromName(fieldName: string): void {
    let option = this.expService.fieldOptions(fieldName);    
    this.applyChange(option);
  }  

  /* ControlValueAccessor implementation */

  propagateChange: (value: any) => void = (value: any) => {};

  writeValue(value: any): void {

    this.selectedField = this.expService.fieldOptions(value);

    if(this.selectedField) {
      this.inputValue = this.selectedField.label;
    }
    
    this.stateChanges.next();
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }  

/* MatFormFieldControl implementation */
  
  controlType = 'field-select-input';
  focused = false;
  errorState = false;
  stateChanges = new Subject<void>();
  static nextId = 0;
  @HostBinding() id = `field-select-input-${FieldSelectComponent.nextId++}`;
  @HostBinding('attr.aria-describedby') describedBy = '';

  get empty() {
    return (this.selectedField == null);
  }

  @Input()
  get value(): string {
    return this.selectedField.name;
  } 
  set value(value: string) {    
    this.writeValue(value);
  }

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  private _placeholder: string; 

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }
  
  @Input()
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  private _required = false;

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }
  
  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() != 'input') {
      this.elRef.nativeElement.querySelector('input').focus();
    }
  }  

}