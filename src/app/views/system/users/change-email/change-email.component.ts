import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { InputTextModule } from 'primeng/inputtext'
import { KeyFilterModule } from 'primeng/keyfilter'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiUserApiClient, UserResponse } from 'src/app/api/admin-api.service.generated'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    KeyFilterModule,
    InputTextModule,
    ButtonModule,
    ValidateMessageComponent,
  ]
})
export class ChangeEmailComponent implements OnInit, AfterContentInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  private timeoutId: number

  // Default
  form: FormGroup
  btnDisabled = false
  email: string

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/
  validationMessages = {
    email: [
      { type: 'required', message: 'You must enter your email' },
      { type: 'email', message: 'Email is not in correct format' },
    ],
  }

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private fb: FormBuilder,

    // Api
    private userApiClient: AdminApiUserApiClient,
  ) { }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close()
    }
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()

    clearTimeout(this.timeoutId)
  }

  ngOnInit(): void {
    this.buildForm()
  }

  ngAfterContentInit(): void {
    this.timeoutId = setTimeout(() => {
      this.loadDetail(this.config.data.id)
    }, 0)
  }

  private buildForm(): void {
    this.form = this.fb.group({
      email: new FormControl(
        this.email || null,
        Validators.compose([Validators.required, Validators.email])
      ),
    })
  }

  private loadDetail(id: any): void {
    this.userApiClient
      .getUserById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserResponse) => {
          this.email = response.email === undefined ? '' : response.email
          this.buildForm()
        },
        error: () => { },
      })
  }

  save(): void {
    this.btnDisabled = true
    this.userApiClient.changeEmail(this.config.data.id, this.form.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.btnDisabled = false
          this.ref.close(this.form.value)
        },
        error: () => {
          this.btnDisabled = false
        }
      })
  }
}
