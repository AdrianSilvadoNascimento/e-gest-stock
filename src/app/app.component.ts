import { Component, HostListener } from '@angular/core'

import { UtilsService } from './services/utils.service'
import { AccountService } from './services/account.service'
import { NavigationEnd, Router } from '@angular/router'
import { filter } from 'rxjs/operators'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  toggleSideNav!: boolean
  shouldShowButton!: boolean
  isMaster: boolean = false
  isAdminArea!: boolean
  isInLoginOrRegisterArea: boolean = false
  private readonly allowedRoutes: string[] = ['user-login', 'user-register']

  constructor(
    private utilService: UtilsService,
    private accountService: AccountService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const currentRoute = event['url'].split('/').pop()!!
        if (this.allowedRoutes.includes(currentRoute)) {
          this.isInLoginOrRegisterArea = true
        }
      })
  }

  ngOnInit(): void {
    this.isMaster = this.accountService.isMaster()
    this.utilService.$toggleMenu.subscribe(res => {
      setTimeout(() => {
        this.toggleSideNav = res
      })
    })

    this.utilService.toggleArea(JSON.parse(localStorage.getItem('toggleArea')!!))
    this.utilService.$hideToggleAdminArea.subscribe(res => {
      setTimeout(() => {
        this.isAdminArea = res
      })
    })
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event): void {
    const targetElement = event.target as HTMLElement
    if (!targetElement.classList.contains('sidenav') && this.toggleSideNav) {
      this.toggleMenu()
    }
  }

  @HostListener('document:mousemove', ['$event'])
  handleDocumentMouseMove(event: MouseEvent): void {
    if (!this.isInLoginOrRegisterArea && event.clientX <= 50 && !this.toggleSideNav) {
      this.toggleMenu()
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleDocumentKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.toggleSideNav) {
      this.toggleMenu()
    }
  }

  toggleMenu(): void {
    this.toggleSideNav = !this.toggleSideNav

    this.utilService.toggle(this.toggleSideNav)
  }
  
  toggleAdmin(): void {
    this.isAdminArea = !this.isAdminArea
    this.utilService.toggleArea(this.isAdminArea)
  }
  
  checkout(): void {
    this.accountService.checkout()
    this.accountService.updateEmployeeName('e-Gest')
  }
}
