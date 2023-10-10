import { Injectable } from '@angular/core';
import { delay, EMPTY, Observable, of } from 'rxjs';
import { Response1 } from '../api-models';

@Injectable({
              providedIn: 'root',
            })
export class ItemService {

  public getById(id: number): Observable<Response1> {
    if (id === 0) {
      return EMPTY;
    }

    const result: Response1 = {
      numberOfItems: 10,
      vat: id > 2 ? 20 : 10,
      countryCode2: id % 2 === 0 ? 'de' : 'en',
      itemPrice: id * 12.34,
      id
    };

    return of(result).pipe(delay(id * 1000));
  }
}
