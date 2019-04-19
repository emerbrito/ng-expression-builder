import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from './shared/material.module';
import { ExpressionBuilderComponent } from './components/expression-builder/expression-builder.component';
import { LogicalOperatorComponent } from './components/logical-operator/logical-operator.component';
import { ConditionComponent } from './components/condition/condition.component';
import { FieldSelectComponent } from './components/field-select/field-select.component';

@NgModule({
  declarations: [
    ExpressionBuilderComponent, 
    LogicalOperatorComponent, 
    ConditionComponent, 
    FieldSelectComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  exports: [
    ExpressionBuilderComponent
  ]
})
export class ExpressionBuilderModule { }
