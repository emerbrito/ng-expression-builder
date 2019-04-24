import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

//import { ExpressionBuilderModule } from '@emerbrito/expression-builder';
import { ExpressionBuilderModule } from '../../../emerbrito/expression-builder/src/lib/expression-builder.module';

import { MaterialModule } from './shared/material.module';
import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    ExpressionBuilderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
