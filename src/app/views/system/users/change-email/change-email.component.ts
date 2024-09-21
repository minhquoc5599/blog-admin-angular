import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { BlockUIModule } from 'primeng/blockui'
import { ButtonModule } from 'primeng/button'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { InputTextModule } from 'primeng/inputtext'
import { KeyFilterModule } from 'primeng/keyfilter'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiUserApiClient, UserResponse } from 'src/app/api/admin-api.service.generated'
import { AlertService } from 'src/app/shared/services/alert.service'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BlockUIModule,
    ProgressSpinnerModule,
    KeyFilterModule,
    InputTextModule,
    ButtonModule,
    ValidateMessageComponent,
  ]
})
export class ChangeEmailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  isLoading: boolean = false
  form: FormGroup
  btnDisabled = false
  email: string
  formSavedEventEmitter: EventEmitter<any> = new EventEmitter()

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/
  validationMessages = {
    email: [
      { type: 'required', message: 'You must enter your email' },
      { type: 'email', message: 'Email is not in correct format' },
    ],
  }

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private alertService: AlertService,

    // Api
    private userApiClient: AdminApiUserApiClient,
  ) { }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close()
    }
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()

  }

  ngOnInit(): void {
    this.buildForm()
    this.loadDetail(this.config.data.id)
  }

  buildForm() {
    this.form = this.fb.group({
      email: new FormControl(
        this.email || null,
        Validators.compose([Validators.required, Validators.email])
      ),
    })
  }

  loadDetail(id: any) {
    this.loading(true)
    this.userApiClient
      .getUserById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserResponse) => {
          this.email = response.email === undefined ? '' : response.email
          this.buildForm()
          this.loading(false)
        },
        error: () => {
          this.loading(false)
        },
      })
  }

  save() {
    this.loading(true)
    this.userApiClient.changeEmail(this.config.data.id, this.form.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.loading(false)
          this.ref.close(this.form.value)
        },
        error: (error) => {
          this.loading(false)
          this.alertService.showError(error)
        }
      })
  }

  private loading(enable: boolean) {
    this.isLoading = enable
    this.btnDisabled = enable
  }
}
