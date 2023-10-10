import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
              providedIn: 'root',
            })
export class LoggerService {
  public readonly events$ = new BehaviorSubject<string[]>([]);

  public log(text: string): void {
    this.events$.next([...this.events$.value, `${new Date().toISOString()} - ${text}`]);
  }
}
