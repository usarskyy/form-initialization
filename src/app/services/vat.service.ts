import { Injectable } from '@angular/core';
import { delay, EMPTY, Observable, of } from 'rxjs';

@Injectable({
              providedIn: 'root',
            })
export class VatService {

  public getByCountryCode2(countryCode2: string): Observable<{countryCode2: string, vat: number}> {
    switch (countryCode2.toLowerCase()) {
      case 'de':
        return of({ countryCode2, vat: 19 }).pipe(delay(800));
      case 'en':
        return of({ countryCode2, vat: 21 }).pipe(delay(600));
      default:
        return EMPTY;
    }
  }
}
