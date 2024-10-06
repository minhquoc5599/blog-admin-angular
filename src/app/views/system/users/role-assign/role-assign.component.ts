import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { InputTextModule } from 'primeng/inputtext'
import { PickListModule } from 'primeng/picklist'
import { forkJoin, Subject, takeUntil } from 'rxjs'
import { AdminApiRoleApiClient, AdminApiUserApiClient, RoleResponse, UserResponse } from 'src/app/api/admin-api.service.generated'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'

@Component({
  selector: 'app-role-assign',
  templateUrl: './role-assign.component.html',
  standalone: true,
  imports: [
    InputTextModule,
    ButtonModule,
    PickListModule,
    ValidateMessageComponent,
  ],
  providers: [
    AdminApiRoleApiClient
  ]
})
export class RoleAssignComponent implements OnInit, AfterContentInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  private timeoutId: number

  // Default
  title: string
  btnDisabled = false
  availableRoles: string[] = []
  seletedRoles: string[] = []

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    // Api
    private userApiClient: AdminApiUserApiClient,
    private roleApiclient: AdminApiRoleApiClient
  ) { }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close()
    }
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()

    clearTimeout(this.timeoutId)
  }

  ngOnInit(): void { }

  ngAfterContentInit(): void {
    this.timeoutId = setTimeout(() => {
      var roles = this.roleApiclient.getAllRoles()

      forkJoin({
        roles,
      })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (repsonse: any) => {
            var roles = repsonse.roles as RoleResponse[]
            roles.forEach(element => {
              this.availableRoles.push(element.name)
            })
            this.loadDetail(this.config.data.id)
          },
          error: () => { },
        })
    }, 0)
  }

  private loadDetail(id: any): void {
    this.userApiClient
      .getUserById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserResponse) => {
          this.seletedRoles = response.roles
          this.availableRoles = this.availableRoles.filter(x => !this.seletedRoles.includes(x))
        },
        error: () => { },
      })
  }

  save(): void {
    this.btnDisabled = true
    this.userApiClient
      .assignRolesToUser(this.config.data.id, this.seletedRoles)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.btnDisabled = false
          this.ref.close(true)
        },
        error: () => {
          this.btnDisabled = false
        }
      })
  }
}
