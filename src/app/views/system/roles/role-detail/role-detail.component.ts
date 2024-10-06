import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { InputTextModule } from 'primeng/inputtext'
import { KeyFilterModule } from 'primeng/keyfilter'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiRoleApiClient, RoleResponse } from 'src/app/api/admin-api.service.generated'
import { UtilityService } from 'src/app/shared/services/utility.service'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    KeyFilterModule,
    ButtonModule,
    ValidateMessageComponent],
  providers: [
    UtilityService
  ]
})
export class RoleDetailComponent implements OnInit, AfterContentInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  private timeoutId: number

  // Default
  form: FormGroup
  btnDisabled: boolean = false
  saveBtnName: string
  private selectedEntity = {} as RoleResponse

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
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private utilityService: UtilityService,
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

    clearTimeout(this.timeoutId)
  }

  ngOnInit() {
    this.buildForm()
  }

  ngAfterContentInit(): void {
    this.timeoutId = setTimeout(() => {
      if (!this.utilityService.isEmpty(this.config.data?.id)) {
        this.loadDetail(this.config.data.id)
        this.saveBtnName = 'Update'
      } else {
        this.saveBtnName = 'Add'
      }
    }, 0)
  }

  private buildForm(): void {
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

  private loadDetail(id: any): void {
    this.roleApiClient.getRoleById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: RoleResponse) => {
          this.selectedEntity = response
          this.buildForm()
        },
        error: () => { },
      })
  }

  save(): void {
    this.btnDisabled = true
    if (this.utilityService.isEmpty(this.config.data?.id)) {
      this.roleApiClient.createRole(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.btnDisabled = false
            this.ref.close(this.form.value)
          },
          error: () => {
            this.btnDisabled = false
          },
        })
    } else {
      this.roleApiClient.updateRole(this.config.data.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.btnDisabled = false
            this.ref.close(this.form.value)
          },
          error: () => {
            this.btnDisabled = false
          },
        })
    }
  }
}
