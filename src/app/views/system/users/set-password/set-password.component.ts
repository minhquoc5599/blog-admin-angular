import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core'
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { BlockUIModule } from 'primeng/blockui'
import { ButtonModule } from 'primeng/button'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { InputTextModule } from 'primeng/inputtext'
import { KeyFilterModule } from 'primeng/keyfilter'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiUserApiClient } from 'src/app/api/admin-api.service.generated'
import { AlertService } from 'src/app/shared/services/alert.service'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
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
export class SetPasswordComponent implements OnInit, OnDestroy {
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
    newPassword: [
      { type: 'required', message: 'You must enter a password' },
      {
        type: 'pattern',
        message: 'Password must be at least 8 characters, at least 1 number, 1 special character, and one uppercase letter',
      },
    ],
    confirmNewPassword: [{ type: 'required', message: 'Confirm password is incorrect' }],
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
  }


  buildForm() {
    this.form = this.fb.group(
      {
        newPassword: new FormControl(
          null,
          Validators.compose([
            Validators.required,
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}$'
            ),
          ])
        ),
        confirmNewPassword: new FormControl(null),
      },
      {
        validators: passwordMatchingValidatior
      }
    )
  }

  save() {
    this.loading(true)
    this.userApiClient.setPassword(this.config.data.id, this.form.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.loading(false)
          this.ref.close(this.form.value)
        }, error: (error) => {
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

export const passwordMatchingValidatior: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('newPassword')
  const confirmPassword = control.get('confirmNewPassword')

  return password?.value === confirmPassword?.value ? null : { notmatched: true }
}
