import { Component } from '@angular/core';
import { LoggerService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ngforms';

  constructor(public readonly logger: LoggerService) {
  }
}
