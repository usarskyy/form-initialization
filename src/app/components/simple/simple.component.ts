import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, EMPTY, map, Observable, startWith, Subscription, switchMap } from 'rxjs';
import { Request1, Response1 } from '../../api-models';
import { createForm, TypeToFormGroup } from '../../form-utils';
import { ItemService, LoggerService, VatService } from '../../services';


@Component({
             selector: 'app-simple',
             templateUrl: './simple.component.html',
             styleUrls: ['./simple.component.scss']
           })
export class SimpleComponent {

  public totalPrice$: Observable<string> = EMPTY;

  public readonly itemId$ = this.activatedRoute.paramMap.pipe(map(pm => {
    const idRaw = pm.get('id');
    return idRaw === null ? null : parseInt(idRaw, 10);
  }));

  public readonly isNew$ = this.itemId$.pipe(map(itemId => itemId == null));

  public readonly showNavigation$ = this.isNew$.pipe(map(isNew => !isNew));

  public formSubscriptions: Subscription[] = [];

  // Initial form instance must be created because we don't know when a data from the server will come.
  // If a form instance is created to late (in my example it cane take 3-4 seconds depending on Id), an exception will be thrown
  public form = createForm(null);

  constructor(private readonly activatedRoute: ActivatedRoute,
              private readonly destroy: DestroyRef,
              private readonly vatService: VatService,
              private readonly logger: LoggerService,
              itemService: ItemService) {

    this.logger.log('PlainFormsComponent constructor ------->');

    this.destroy.onDestroy(() => {
      for (const subscription of this.formSubscriptions) {
        subscription.unsubscribe();
      }

      this.logger.log('-------> PlainFormsComponent destroyed');
    });

    // we need to subscribe to an initial form
    this.initFormSubscriptions(this.form, null);

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

          // every time we get new data we create new form instance,
          // subscribe to field change events to set VAT when country changes and update total price
          const newForm = createForm(data);

          this.initFormSubscriptions(newForm, data);

          this.form = newForm;
        });
  }

  private initFormSubscriptions(form: FormGroup<TypeToFormGroup<Request1>>, data: Response1 | null) {

    for (const subscription of this.formSubscriptions) {
      subscription.unsubscribe();

      this.logger.log(`formSubscriptions->unsubscribed`);
    }

    this.formSubscriptions = [];

    this.totalPrice$ = combineLatest([
                                       form.controls.itemPrice.valueChanges.pipe(startWith(data?.itemPrice || 0)),
                                       form.controls.numberOfItems.valueChanges.pipe(startWith(data?.numberOfItems || 0)),
                                       form.controls.vat.valueChanges.pipe(startWith(data?.vat || 0))
                                     ])
      .pipe(
        map(([itemPrice, numberOfItems, vat]) => {
          return (itemPrice * numberOfItems + itemPrice * numberOfItems * vat / 100).toFixed(2);
        }),
      );

    this.formSubscriptions.push(
      this.form
          .controls
          .countryCode2
          .valueChanges
          .pipe(
            switchMap(countryCode2 => {
              this.logger.log(`country code changed to '${countryCode2}'`);

              return this.vatService.getByCountryCode2(countryCode2);
            }),
          )
          .subscribe(data => {
            this.logger.log(`received new VAT value '${data.vat}' for '${data.countryCode2}''`);

            this.form.controls.vat.setValue(data.vat);
          })
    );
  }
}
