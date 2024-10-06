import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiRoleApiClient, PermissionModel, RoleClaimsDto } from 'src/app/api/admin-api.service.generated'

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CheckboxModule,
    ButtonModule
  ]
})
export class PermissionComponent implements OnInit, AfterContentInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  private timeoutId: number

  // Default
  form: FormGroup
  btnDisabled = false
  permissions: RoleClaimsDto[] = []
  selectedPermissions: RoleClaimsDto[] = []

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
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
      this.loadDetail(this.config.data.id)
    }, 0)
  }

  private loadDetail(roleId: string): void {
    this.roleApiClient
      .getAllRolePermissions(roleId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PermissionModel) => {
          this.permissions = response.roleClaims ? response.roleClaims : []
          this.buildForm()
        },
        error: () => { }
      })
  }

  private buildForm(): void {
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

  save(): void {
    this.btnDisabled = true
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
          this.btnDisabled = false
          this.ref.close(this.form.value)
        },
        error: () => {
          this.btnDisabled = false
        }
      })
  }
}
