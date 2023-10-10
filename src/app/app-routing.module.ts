import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormxComponent, InitvarComponent, ProblemComponent, SimpleComponent } from './components';

const routes: Routes = [
  {
    path: 'problem/new',
    component: ProblemComponent
  },
  {
    path: 'problem/:id',
    component: ProblemComponent
  },

  {
    path: 'simple/new',
    component: SimpleComponent
  },
  {
    path: 'simple/:id',
    component: SimpleComponent
  },

  {
    path: 'initvar/new',
    component: InitvarComponent
  },
  {
    path: 'initvar/:id',
    component: InitvarComponent
  },

  {
    path: 'formx/new',
    component: FormxComponent
  },
  {
    path: 'formx/:id',
    component: FormxComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
