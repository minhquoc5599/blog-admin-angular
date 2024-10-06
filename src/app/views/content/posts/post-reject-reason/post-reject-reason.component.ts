import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { InputTextModule } from 'primeng/inputtext'
import { KeyFilterModule } from 'primeng/keyfilter'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiPostApiClient } from 'src/app/api/admin-api.service.generated'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'

@Component({
  selector: 'app-post-reject-reason',
  templateUrl: './post-reject-reason.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    KeyFilterModule,
    InputTextModule,
    ButtonModule,
    ValidateMessageComponent,
  ]
})
export class PostRejectReasonComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  form: FormGroup
  btnDisabled = false

  // Validate
  validationMessages = {
    reason: [{ type: 'required', message: 'You must enter your reason' }],
  }

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private fb: FormBuilder,

    // Api
    private postApiClient: AdminApiPostApiClient,
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

  private buildForm(): void {
    this.form = this.fb.group({
      reason: new FormControl(null, Validators.required)
    })
  }

  save(): void {
    this.btnDisabled = true
    this.postApiClient.rejectPost(this.config.data.id, this.form.value)
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
