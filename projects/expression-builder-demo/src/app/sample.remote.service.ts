import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { share, distinctUntilChanged, debounceTime, switchMap, tap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LookupService } from '../../../../projects/emerbrito/expression-builder/src/lib/models/models';

export interface Person {
    UserName: string;
    FirstName: string;
    LastName: string;
    MiddleName?: any;
    Gender: string;
    Age?: any;
    Emails: string[];
    FavoriteFeature: string;
    Features: string[];
    HomeAddress?: any;  
}

@Injectable({
  providedIn: 'root'
})
export class SampleRemoteService implements OnDestroy, LookupService {

  private _data: BehaviorSubject<Person[]> = new BehaviorSubject([]);
  private _search: Subject<string> = new Subject();
  private _loading: boolean;
  private searchSubs: Subscription;

  error: (err: any) => void;

  get data(): Observable<Person[]> {
    return this._data.pipe(share());
  }

  get loading(): boolean {
    return this._loading;
  }

  constructor(
    private http: HttpClient
  ) 
  {  
    this.setup();   
  }

  setup() {
  
    this.searchSubs = this._search.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(data => this._loading = true),
      switchMap(value => this.retrieveRemote(value))
    )
    .subscribe(data => {
      this._data.next(data);
      this._loading = false;
    }, err => {
      this._loading = false;
      this.emitError(err);
    });

  }

  ngOnDestroy() {
    if(this.searchSubs) this.searchSubs.unsubscribe();
    this._data.complete();    
    this._search.complete();
  }

  public search(nameContains: string): void {
    this._search.next(nameContains);
  }

  private retrieveRemote(nameContains: string): Observable<Person[]> {

    let url = 'https://services.odata.org/TripPinRESTierService/People'; 
    
    if(nameContains) {
      url += `?$filter=contains(FirstName,'${nameContains}')`;
    }

    return this.http.get(url).pipe(
      map((resp: any) => resp.value)
    );
  }

  private emitError(err: any): void {
    if(this.error) {
      this.error(err);
    }
  }

}
