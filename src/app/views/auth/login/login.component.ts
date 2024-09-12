import { StorageService } from 'src/app/shared/services/storage.service';
import { Url } from 'src/app/shared/constants/url.constant';
import { environment } from 'src/enviroments/environment';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ADMIN_API_BASE_URL, AdminApiAuthApiClient, LoginRequest, LoginResult } from 'src/app/api/admin-api.service.generated'
import { Component, OnDestroy } from '@angular/core'
import { NgStyle } from '@angular/common'
import { IconDirective } from '@coreui/icons-angular'
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardGroupComponent,
  TextColorDirective,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective
} from '@coreui/angular'
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { ToastModule } from 'primeng/toast'
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    NgStyle,
    ReactiveFormsModule,
    ToastModule,
  ],
  providers: [
    { provide: ADMIN_API_BASE_URL, useValue: environment.API_URL },
    AlertService,
    AdminApiAuthApiClient,
    StorageService
  ]
})

export class LoginComponent implements OnDestroy {
  loginForm: FormGroup
  private ngUnsubsribe = new Subject<void>()
  loading = false

  constructor(
    private fb: FormBuilder,
    private authApi: AdminApiAuthApiClient,
    private alertService: AlertService,
    private router: Router,
    private storage: StorageService) {
    this.loginForm = this.fb.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubsribe.next()
    this.ngUnsubsribe.complete()
  }

  login(): void {
    this.loading = true
    let request: LoginRequest = new LoginRequest({
      userName: this.loginForm.controls['username'].value,
      password: this.loginForm.controls['password'].value
    })
    this.authApi.login(request)
      .pipe(takeUntil(this.ngUnsubsribe))
      .subscribe({
        next: (res: LoginResult) => {
          // Store token and refresh token to local storage
          this.storage.saveToken(res.token)
          this.storage.saveRefreshToken(res.refreshToken)
          this.storage.saveUser(res)
          this.router.navigate([Url.DASHBOARD])
        },
        error: (error: any) => {
          this.alertService.showError("Login invalid")
          this.loading = false
        }
      })
  }
}
