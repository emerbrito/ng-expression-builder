import { Component, ChangeDetectionStrategy } from '@angular/core';
//import { Field, QueryExpression, ExpressionChangeEvent } from '@emerbrito/expression-builder';
import { Field, QueryExpression, ExpressionChangeEvent } from '../../../emerbrito/expression-builder/src/lib/models/models';
import { sampleFields, sampleData } from './models/sample-data';

@Component({
  selector: 'eb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  fields: Field[] = sampleFields;
  data: QueryExpression;

  valid: boolean;
  expression: QueryExpression;

  ngOnInit(): void {
    this.data = {
      "operator": "and",
      "rules": [{
        "fieldName": "driversLicense",
        "condition": "notnull"
      }, {
        "fieldName": "age",
        "condition": "ge",
        "value": "50"
      }]
    } as any;
  }
  
  feed(): void {
    this.data = sampleData as QueryExpression;
  }
  
  change(e: ExpressionChangeEvent) {
    this.valid = e.valid;
    this.expression = e.expression
  }
  

}
