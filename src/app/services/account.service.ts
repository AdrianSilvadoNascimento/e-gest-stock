import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { UserModel } from '../models/user-model';
import { BehaviorSubject, Observable, race, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private readonly BASE_URL = environment.BASE_URL + '/user';

  private accountName = new BehaviorSubject<string>('');
  $accountName = this.accountName.asObservable();

  private remainingTrialDays = new BehaviorSubject<number>(0);
  $remainingTrialDays = this.remainingTrialDays.asObservable();

  private userHaveToPayObs = new BehaviorSubject<boolean>(false);
  $userHaveToPayObs = this.userHaveToPayObs.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private readonly utilsService: UtilsService
  ) {}

  updateRemainingTrialDays(remainingTrialDays: number) {
    this.remainingTrialDays.next(remainingTrialDays);
    localStorage.setItem('trialDays', remainingTrialDays.toString());
  }

  updateHeaderAccountName(name: string) {
    this.accountName.next(name);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  isMaster(): boolean {
    const masterAccount = localStorage.getItem('accountType')!;
    return parseInt(masterAccount) === 1;
  }

  userHaveToPay(userId: string, trialDays: number): void {
    this.getUserInfo(userId).subscribe((userInfo) => {
      if (
        this.isLoggedIn() &&
        !userInfo.is_trial &&
        !userInfo.is_assinant &&
        trialDays <= 0
      ) {
        this.userHaveToPayObs.next(true);
        this.router.navigate(['/contract-subscription']);
      } else {
        this.userHaveToPayObs.next(false);
        this.router.navigate(['/index']);
      }
    });
  }

  loginUser(EmployeeModel: { email: string; password: string }) {
    const url = `${this.BASE_URL}/login-user`;

    return this.http.post(url, EmployeeModel).pipe(
      tap((res: any) => {
        const trialDays = this.calculateRemainingDays(
          new Date(res?.expiration_trial)
        );
        this.updateRemainingTrialDays(trialDays);
        this.setCache(res);
        this.userHaveToPay(res['userId'], trialDays);
      })
    );
  }

  getUserInfo(userId: string): Observable<UserModel> {
    return this.http
      .get<UserModel>(`${this.BASE_URL}/${userId}/account-info`)
      .pipe(tap((res) => res));
  }

  createUserAccount(userModel: UserModel): Observable<UserModel> {
    const url = `${this.BASE_URL}/register-user`;
    const expiration_trial = new Date();
    expiration_trial.setDate(expiration_trial.getDate() + 7);

    const body = { ...userModel, type: 1, expiration_trial };

    return this.http
      .post<UserModel>(url, body)
      .pipe(tap(() => this.router.navigate(['../user-login'])));
  }

  setCache(data: any): void {
    const userId = data?.userId;
    const employeeId = data?.employeeId;
    const trialDays = this.calculateRemainingDays(
      new Date(data.expiration_trial)
    );
    let user_name = data?.user;
    localStorage.setItem('userId', userId);
    localStorage.setItem('employeeId', employeeId);
    localStorage.setItem('token', data?.token);
    localStorage.setItem('expiresIn', data?.expiresIn);
    localStorage.setItem('accountType', data?.type);
    localStorage.setItem('trialDays', trialDays.toString());

    if (employeeId?.length) {
      this.getUserInfo(userId).subscribe((user) => {
        localStorage.setItem('employee_name', user_name);

        user_name = user.name;
        this.updateHeaderAccountName(user.name);
        localStorage.setItem('account_name', user_name);
      });
    } else {
      this.updateHeaderAccountName(user_name);
      localStorage.setItem('account_name', user_name);
    }
  }

  checkout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('employeeId');
    localStorage.removeItem('token');
    localStorage.removeItem('account_name');
    localStorage.removeItem('employee_name');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('accountType');
    localStorage.removeItem('trialDays');
    this.updateRemainingTrialDays(0);
    this.utilsService.toggleArea(true);
    this.utilsService.hideFakeSidenav(false);
    this.utilsService.toggleRemainingDays(false);

    localStorage.removeItem('isHideRemainingInfo');
    localStorage.removeItem('isHideFakeSidenav');
  }

  private calculateRemainingDays(endDate: Date): number {
    const today = new Date();

    const remainingDays = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return remainingDays;
  }
}
