import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, shareReplay, tap } from 'rxjs'
import { HttpClient, HttpHeaders } from '@angular/common/http'

import { CategoryModel } from '../models/category-model'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  private readonly BASE_URL = `${environment.BASE_URL}/admin/category`
  readonly token: string | null = localStorage.getItem('token')
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.token}`
  })

  private toggleMenu = new BehaviorSubject<boolean>(true)
  $toggleMenu = this.toggleMenu.asObservable()

  private toggleRemainingInfoDays = new BehaviorSubject<boolean>(false)
  $toggleRemainingInfoDays = this.toggleRemainingInfoDays.asObservable()

  private hideFakeSidenavBar = new BehaviorSubject<boolean>(true)
  $hideFakeSidenavBar = this.hideFakeSidenavBar.asObservable()

  private hideToggleMenu = new BehaviorSubject<boolean>(true)
  $hideToggleMenu = this.hideToggleMenu.asObservable()

  private toggleAdminArea = new BehaviorSubject<boolean>(true)
  $hideToggleAdminArea = this.toggleAdminArea.asObservable()

  private categoryList$!: Observable<CategoryModel[]> | null

  constructor(private http: HttpClient) { }

  toggle(toggle: boolean): void {
    this.toggleMenu.next(toggle)
  }

  toggleRemainingDays(isHide: boolean): void {
    this.toggleRemainingInfoDays.next(isHide)
    localStorage.setItem('isHideRemainingInfo', isHide.toString())
  }

  hideFakeSidenav(isHide: boolean): void {
    this.hideFakeSidenavBar.next(isHide)
    localStorage.setItem('isHideFakeSidenav', isHide.toString())
  }

  hideMenuButton(hide: boolean): void {
    this.hideToggleMenu.next(hide)
  }

  toggleArea(toggle: boolean): void {
    this.toggleAdminArea.next(toggle)
    localStorage.setItem('toggleArea', JSON.stringify(toggle))
  }

  locateEmployeePosition(type: number): string {
    let position!: string
    switch (type) {
      case 1:
        position = 'Master'
        break
      case 2:
        position = 'Operário'
        break
      default:
        position = 'Analista'
        break
    }

    return position
  }

  fetchCategories(): Observable<CategoryModel[]> {
    const userId = localStorage.getItem('userId')!!
    if (!this.categoryList$) {
      this.categoryList$ = this.http.get<CategoryModel[]>(
        `${this.BASE_URL}/get-categories/${userId}`, { headers: this.headers }
      ).pipe(tap(res => res))
      shareReplay(1)
    }

    return this.categoryList$
  }

  getCategory(categoryId: string): Observable<CategoryModel> {
    return this.http.get<CategoryModel>(
      `${this.BASE_URL}/get-category/${categoryId}`, { headers: this.headers }
    ).pipe(tap(res => res))
  }

  registerCategory(categoryModel: CategoryModel): Observable<CategoryModel> {
    return this.http.post<CategoryModel>(
      `${this.BASE_URL}/register-category/${localStorage.getItem('userId')}`,
      categoryModel,
      { headers: this.headers}
    ).pipe(tap(res => res))
  }

  updateCategory(categoryModel: CategoryModel, categoryId: string): Observable<CategoryModel> {
    return this.http.put<CategoryModel>(
      `${this.BASE_URL}/update-category/${categoryId}`, categoryModel, { headers: this.headers }
    ).pipe(tap(res => res))
  }

  deleteCategory(categoryId: string): Observable<CategoryModel> {
    this.categoryList$ = null

    return this.http.delete<CategoryModel>(
      `${this.BASE_URL}/delete-category/${categoryId}`, { headers: this.headers }
    ).pipe(tap(res => res))
  }
}
