//import { Field, FieldType, ConditionExpression } from '@emerbrito/expression-builder';
import { Field, FieldType, ConditionExpression } from '../../../../emerbrito/expression-builder/src/lib/models/models'
import { SampleRemoteService } from '../sample.remote.service';


export const sampleFields: Field[] = [
    { name: 'firstName', label: 'First Name', type: FieldType.Text },
    { name: 'lastName', label: 'Last Name', type: FieldType.Text },    
    { name: 'applicatonDate', label: 'Application Date', type: FieldType.Date },    
    { name: 'age', label: 'Age', type: FieldType.Number },    
    { name: 'driversLicense', label: 'Driver Licesne', type: FieldType.Text },
    {
        name: 'manager',
        label: 'Manager',
        type: FieldType.Lookup,
        lookup: {
            textField: 'FirstName',
            valueField: 'UserName',
            service: SampleRemoteService
        }
    },    
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
	"rules": [
        {
		"fieldName": "voter",
		"condition": "eq",
        "value": "true"
        },
        {
            "fieldName": "driversLicense",
            "condition": "notnull"
        },
        {
		"operator": "or",
            "rules": [
                {
                "fieldName": "married",
                "condition": "eq",
                "value": "true"
                }, {
                    "fieldName": "age",
                    "condition": "ge",
                    "value": "21"
                },
                {
                    "fieldName": "manager",
                    "condition": "eq",
                    "value": {
                        FirstName: 'Georgina',
                        UserName: 'georginabarlow'
                    }
                }
            ]
        }
    ]
}


