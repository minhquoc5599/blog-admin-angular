import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'
import { AdminApiRoleApiClient, RoleResponse } from 'src/app/api/admin-api.service.generated'
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core'
import { Subject, takeUntil } from 'rxjs'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { UtilityService } from 'src/app/shared/services/utility.service'
import { KeyFilterModule } from 'primeng/keyfilter'
import { BlockUIModule } from 'primeng/blockui'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { InputTextModule } from 'primeng/inputtext'
import { DialogModule } from 'primeng/dialog'
import { AlertService } from 'src/app/shared/services/alert.service'
import { ButtonModule } from 'primeng/button'


@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    KeyFilterModule,
    BlockUIModule,
    ProgressSpinnerModule,
    ButtonModule,
    ValidateMessageComponent],
  providers: [
    UtilityService
  ]
})
export class RoleDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  public isLoading: boolean = false
  public form: FormGroup
  public btnDisabled = false
  public saveBtnName: string
  selectedEntity = {} as RoleResponse

  formSavedEventEmitter: EventEmitter<any> = new EventEmitter()

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/
  validationMessages = {
    name: [
      { type: 'required', message: 'You must enter a permission name' },
      { type: 'minlength', message: 'You must enter at least 3 characters' },
      { type: 'maxlength', message: 'You cannot enter more than 255 characters' },
    ],
    displayName: [{ type: 'required', message: 'You must enter a display name' }],
  }

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private utilityService: UtilityService,
    private alertService: AlertService,
    private fb: FormBuilder,

    // Api
    private roleApiClient: AdminApiRoleApiClient,
  ) { }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close()
    }
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  ngOnInit() {
    this.buildForm()
    if (!this.utilityService.isEmpty(this.config.data?.id)) {
      this.loadDetail(this.config.data.id)
      this.saveBtnName = 'Update'
    } else {
      this.saveBtnName = 'Add'
    }
  }

  buildForm() {
    this.form = this.fb.group({
      name: new FormControl(
        this.selectedEntity.name || null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(255),
          Validators.minLength(3),
        ])
      ),
      displayName: new FormControl(
        this.selectedEntity.displayName || null,
        Validators.required
      ),
    })
  }

  loadDetail(id: any) {
    this.loading(true)

    // Call api
    this.roleApiClient.getRoleById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: RoleResponse) => {
          this.selectedEntity = response
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
    if (this.utilityService.isEmpty(this.config.data?.id)) {
      this.roleApiClient.createRole(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form.value)
            this.loading(false)
          },
          error: (error) => {
            this.loading(false)
            this.alertService.showError(error)
          }
        })
    } else {
      this.roleApiClient.updateRole(this.config.data.id, this.form.value)
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
  }

  private loading(enable: boolean) {
    this.isLoading = enable
    this.btnDisabled = enable
  }
}
