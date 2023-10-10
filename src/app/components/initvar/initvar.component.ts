import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, EMPTY, map, Observable, skipWhile, switchMap } from 'rxjs';
import { createForm } from '../../form-utils';
import { ItemService, LoggerService, VatService } from '../../services';

@Component({
  selector: 'app-initvar',
  templateUrl: './initvar.component.html',
  styleUrls: ['./initvar.component.scss']
})
export class InitvarComponent {

  #initializing = false;

  private set initializing(v: boolean) {
    this.logger.log(`initializing flag changed to '${v}'`);
    this.#initializing = v;
  }

  public totalPrice$: Observable<string> = EMPTY;

  public readonly itemId$ = this.activatedRoute.paramMap.pipe(map(pm => {
    const idRaw = pm.get('id');
    return idRaw === null ? null : parseInt(idRaw, 10);
  }));

  public readonly isNew$ = this.itemId$.pipe(map(itemId => itemId == null));

  public readonly showNavigation$ = this.isNew$.pipe(map(isNew => !isNew));

  // form is created once when component is instantiated
  public form = createForm(null);

  constructor(private readonly activatedRoute: ActivatedRoute,
              private readonly destroy: DestroyRef,
              private readonly vatService: VatService,
              private readonly logger: LoggerService,
              itemService: ItemService) {

    this.logger.log('InitvarComponent constructor /////////>');

    this.destroy.onDestroy(() => {
      this.logger.log('/////////> InitvarComponent destroyed');
    });

    this.totalPrice$ = combineLatest([
                                       this.form.controls.itemPrice.valueChanges,
                                       this.form.controls.numberOfItems.valueChanges,
                                       this.form.controls.vat.valueChanges
                                     ])
      .pipe(
        map(([itemPrice, numberOfItems, vat]) => {
          return (itemPrice * numberOfItems + itemPrice * numberOfItems * vat / 100).toFixed(2);
        }),
        takeUntilDestroyed(this.destroy),
      );

    this.form
        .controls
        .countryCode2
        .valueChanges
        .pipe(
          skipWhile(() => {
            if (this.#initializing) {
              this.logger.log(`Will skip country code changed because initializing='${this.#initializing}'`);
            }

            return this.#initializing;
          }),
          switchMap(countryCode2 => {
            this.logger.log(`country code changed to '${countryCode2}'`);

            return this.vatService.getByCountryCode2(countryCode2);
          }),
          takeUntilDestroyed(this.destroy),
        )
        .subscribe(data => {
          this.logger.log(`received new VAT value '${data.vat}' for '${data.countryCode2}''`);

          this.form.controls.vat.setValue(data.vat);
        })

    this.itemId$
        .pipe(
          switchMap(id => {
            this.logger.log(`received ItemId '${id}'`);

            return id == null ? EMPTY : itemService.getById(id);
          }),
          takeUntilDestroyed(destroy),
        )
        .subscribe(data => {
          this.logger.log(`received data for '${data.id}'`);

          this.initializing = true;

          this.form.setValue({
                               countryCode2: data.countryCode2,
                               vat: data.vat,
                               itemPrice: data.itemPrice,
                               numberOfItems: data.numberOfItems
                             });

          this.initializing = false;
        });
  }
}
