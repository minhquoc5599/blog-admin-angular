import { AdminApiUserApiClient, AdminApiRoleApiClient, RoleResponse, UserResponse } from 'src/app/api/admin-api.service.generated'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core'
import { forkJoin, Subject, takeUntil } from 'rxjs'
import { BlockUIModule } from 'primeng/blockui'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { InputTextModule } from 'primeng/inputtext'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'
import { ButtonModule } from 'primeng/button'
import { PickListModule } from 'primeng/picklist'
import { AlertService } from 'src/app/shared/services/alert.service'

@Component({
  selector: 'app-role-assign',
  templateUrl: './role-assign.component.html',
  standalone: true,
  imports: [
    BlockUIModule,
    ProgressSpinnerModule,
    InputTextModule,
    ButtonModule,
    PickListModule,
    ValidateMessageComponent,
  ],
  providers: [
    AdminApiRoleApiClient
  ]
})
export class RoleAssignComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  public isLoading: boolean = false
  public title: string
  public btnDisabled = false
  public availableRoles: string[] = []
  public seletedRoles: string[] = []
  formSavedEventEmitter: EventEmitter<any> = new EventEmitter()

  constructor(
    private alertService: AlertService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,

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

  }

  ngOnInit(): void {
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
          this.isLoading = false
        },
        error: () => {
          this.isLoading = false
        },
      })
  }

  loadDetail(id: any) {
    this.isLoading = true
    this.userApiClient
      .getUserById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserResponse) => {
          this.seletedRoles = response.roles
          this.availableRoles = this.availableRoles.filter(x => !this.seletedRoles.includes(x))
          this.isLoading = false
        },
        error: () => {
          this.isLoading = false
        },
      })
  }

  save() {
    this.isLoading = true
    this.userApiClient
      .assignRolesToUser(this.config.data.id, this.seletedRoles)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.isLoading = false
          this.ref.close(true)
        },
        error: (error) => {
          this.isLoading = false
          this.alertService.showError(error)
        }
      })
  }
}
