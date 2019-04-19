//import { Field, FieldType, ConditionExpression } from '@emerbrito/expression-builder';
import { Field, FieldType, ConditionExpression } from '../../../../emerbrito/expression-builder/src/lib/models/models'


export const sampleFields: Field[] = [
    { name: 'firstName', label: 'First Name', type: FieldType.Text },
    { name: 'lastName', label: 'Last Name', type: FieldType.Text },    
    { name: 'applicatonDate', label: 'Application Date', type: FieldType.Date },    
    { name: 'age', label: 'Age', type: FieldType.Number },    
    { 
        name: 'married', 
        label: 'Married', 
        type: FieldType.Boolean,
        values: [
            { value: 'true', label: 'Yes'},
            { value: 'false', label: 'No'},
        ]
    },
{ 
    name: 'voter', 
    label: 'Registered to Vote', 
    type: FieldType.Boolean,
    values: [
        { value: 'true', label: 'Yes'},
        { value: 'false', label: 'No'},
    ]
},
    { 
        name: 'gender', 
        label: 'Gender', 
        type: FieldType.Text,
        values: [
            { value: 'male', label: 'Male'},
            { value: 'female', label: 'Female'},
        ]
    }    
];

export const sampleData = {
	"operator": "and",
	"rules": [{
		"fieldName": "voter",
		"condition": "eq",
        "value": "true"
    }, {
		"operator": "or",
		"rules": [{
			"fieldName": "married",
			"condition": "eq",
			"value": "true"
		}, {
			"fieldName": "age",
			"condition": "ge",
			"value": "21"
		}]
	}]
}


