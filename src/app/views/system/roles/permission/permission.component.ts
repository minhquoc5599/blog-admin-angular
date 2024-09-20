import { CommonModule } from '@angular/common'
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BlockUIModule } from 'primeng/blockui'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiRoleApiClient, PermissionModel, RoleClaimsDto } from 'src/app/api/admin-api.service.generated'
import { AlertService } from 'src/app/shared/services/alert.service'

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BlockUIModule,
    ProgressSpinnerModule,
    CheckboxModule,
    ButtonModule
  ]
})
export class PermissionComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  public isLoading: boolean = false
  public form: FormGroup
  public btnDisabled = false
  public permissions: RoleClaimsDto[] = []
  public selectedPermissions: RoleClaimsDto[] = []
  formSavedEventEmitter: EventEmitter<any> = new EventEmitter()

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private alertService: AlertService,

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
    this.loadDetail(this.config.data.id)
  }

  loadDetail(roleId: string) {
    this.loading(true)
    this.roleApiClient
      .getAllRolePermissions(roleId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PermissionModel) => {
          this.permissions = response.roleClaims ? response.roleClaims : []
          this.buildForm()
          this.loading(false)
        },
        error: () => {
          this.loading(false)
        },
      })
  }

  buildForm() {
    this.form = this.fb.group({})

    for (let index = 0; index < this.permissions.length; index++) {
      const permission = this.permissions[index]
      if (permission.selected) {
        this.selectedPermissions.push(new RoleClaimsDto({
          selected: true,
          displayName: permission.displayName,
          type: permission.type,
          value: permission.value
        }))
      }
    }
  }

  save() {
    this.loading(true)
    var roleClaims: RoleClaimsDto[] = []
    for (let index = 0; index < this.permissions.length; index++) {
      const isGranted = this.selectedPermissions.filter((x) => x.value == this.permissions[index].value).length > 0

      roleClaims.push(new RoleClaimsDto({
        type: this.permissions[index].type,
        selected: isGranted,
        value: this.permissions[index].value
      }))
    }
    var updateValues = new PermissionModel({
      roleId: this.config.data.id,
      roleClaims: roleClaims,
    })
    this.roleApiClient
      .savePermission(updateValues)
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
