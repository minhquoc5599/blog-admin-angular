import { NgStyle } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  TextColorDirective
} from '@coreui/angular'
import { IconDirective } from '@coreui/icons-angular'
import { ToastModule } from 'primeng/toast'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiAuthApiClient, AuthenticatedResponse, LoginRequest } from 'src/app/api/admin-api.service.generated'
import { Url } from 'src/app/shared/constants/url.constant'
import { AlertService } from 'src/app/shared/services/alert.service'
import { LoadingService } from 'src/app/shared/services/loading.service'
import { StorageService } from 'src/app/shared/services/storage.service'

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
    AdminApiAuthApiClient,
    StorageService
  ]
})

export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup
  private ngUnsubsribe = new Subject<void>()
  isLoading = false

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private alertService: AlertService,
    private storageService: StorageService,
    private loadingService: LoadingService,

    // Api
    private authApi: AdminApiAuthApiClient,
  ) {

  }

  ngOnInit(): void {
    this.builForm()
    this.loadingService.httpError.asObservable().subscribe(loading => {
      this.isLoading = loading
    })
  }

  ngOnDestroy(): void {
    this.ngUnsubsribe.next()
    this.ngUnsubsribe.complete()
  }

  builForm(): void {
    this.loginForm = this.fb.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    })
  }

  login(): void {
    this.isLoading = true
    let request: LoginRequest = new LoginRequest({
      userName: this.loginForm.controls['username'].value,
      password: this.loginForm.controls['password'].value
    })
    this.authApi.login(request)
      .pipe(takeUntil(this.ngUnsubsribe))
      .subscribe({
        next: (res: AuthenticatedResponse) => {
          // Store token and refresh token to local storage
          this.storageService.saveToken(res.token)
          this.storageService.saveRefreshToken(res.refreshToken)
          this.storageService.saveUser(res)
          this.router.navigate([Url.DASHBOARD])
        },
        error: (error: any) => {
          this.alertService.showError(error)
          this.isLoading = false
        }
      })
  }
}
