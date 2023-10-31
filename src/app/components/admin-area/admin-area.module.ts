import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { IndexComponent } from './index/index.component'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [
    IndexComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: 'index', component: IndexComponent },
    ]),
  ]
})
export class AdminAreaModule { }