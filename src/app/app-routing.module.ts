import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { HomeComponent } from './components/home/home.component'
import { InfoItemComponent } from './components/info-item/info-item.component'
import { RegisterItemComponent } from './components/register-item/register-item.component'

const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { path: 'index', component: HomeComponent },
  { path: 'info-item/:id', component: InfoItemComponent },
  { path: 'register-item', component: RegisterItemComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
