# Angular Material Expression Builder

![Expression Builder](https://user-images.githubusercontent.com/5498239/56397092-3cc43080-6210-11e9-9f44-f64984736e34.png)

A simple to use expression builder created with [Angular Material][1] components.  
Outputs a data structure (JSON) representing the expression which you can use to build queries and filters.

````javascript
npm install @emerbrito/expression-builder
````

## Getting Started

The first step is to configure the fields available to the end user when building expressions.  
A field is defined by the `Field` interface:

````typescript
export interface Field {
    label: string,
    name: string,    
    type: FieldType,
    values?: OptionValue[]
}
````

Field type is used for input validation and to render the appropriated control.  
Property `values` is optional. When specified a dropdown with the options will be rendered indifferent of the field type, which still applies to validation.

Bellow is an example of some field definitions:

````typescript
const fields = [
    {
        name: "firstName",
        label: "First Name",
        type: FieldType.Text
    },
    {
        "name": "married",
        "label": "Married",
        "type": FieldType.Boolean,
        "values": [
            {
                "value": "true ",
                "label ": "Yes"
            },
            {
                "value": "false ",
                "label ": "No"
            }
        ]
    }
];
````
Use the component's input property to pass the field configurations:

````html
<expression-builder 
    [fields]="fields" 
    [data]="exp" 
    (valuechange)="changeHandler($event)">
</expression-builder>
````
### Component properties

#### @Input() fields 
Type: `Field[]`  
Required. Array containing the fields available trough the expression builder.

#### @Input() data
Type: `QueryExpression`
Optional.  
Initial expression.

#### @Output() valuechange
Argument: `ExpressionChangeEvent`  
Fires every time the expression changes.
Contains the current expression and a flag indicating whether or not it is in a valid state.

### Sample Expression
Bellow is a sample of the expression produce by the component:

````javascript
{
  "operator": "and",
  "rules": [
    {
      "fieldName": "voter",
      "condition": "eq",
      "value": "true"
    },
    {
      "operator": "or",
      "rules": [
        {
          "fieldName": "married",
          "condition": "eq",
          "value": "true"
        },
        {
          "fieldName": "age",
          "condition": "ge",
          "value": "21"
        }
      ]
    }
  ]
}
````

### Before You Start
This package dependens on [Angular Material][1].  
Before you start make sure you add it to your project.

````javascript
ng add @angular/material
````

More details on [Angular Material][1] installation can be found [here][2].

[1]: https://material.angular.io/
[2]: https://material.angular.io/guide/getting-started