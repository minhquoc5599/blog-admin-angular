import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ConfirmationService } from 'primeng/api'
import { BadgeModule } from 'primeng/badge'
import { BlockUIModule } from 'primeng/blockui'
import { ButtonModule } from 'primeng/button'
import { DialogService } from 'primeng/dynamicdialog'
import { InputTextModule } from 'primeng/inputtext'
import { PaginatorModule } from 'primeng/paginator'
import { PanelModule } from 'primeng/panel'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { TableModule } from 'primeng/table'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiUserApiClient, UserResponse, UserResponsePagingResponse } from 'src/app/api/admin-api.service.generated'
import { Message } from 'src/app/shared/constants/message.constant'
import { AlertService } from 'src/app/shared/services/alert.service'
import { ChangeEmailComponent } from './change-email/change-email.component'
import { RoleAssignComponent } from './role-assign/role-assign.component'
import { SetPasswordComponent } from './set-password/set-password.component'
import { UserDetailComponent } from './user-detail/user-detail.component'

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PanelModule,
    TableModule,
    InputTextModule,
    BadgeModule,
    PaginatorModule,
    BlockUIModule,
    ProgressSpinnerModule,
    ButtonModule],
  providers: [
    AdminApiUserApiClient,
    DialogService,
  ]
})
export class UserComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  isLoading: boolean = false

  //Page setting
  pageIndex: number = 1
  pageSize: number = 10
  totalCount: number

  //Business variables
  items: UserResponse[]
  selectedItems: UserResponse[] = []
  keyword: string = ''

  constructor(
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    public dialogService: DialogService,

    //Api
    private userApiClient: AdminApiUserApiClient,
  ) { }

  ngOnInit(): void {
    this.getData()
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  getData(selectionId = null) {
    this.isLoading = true
    this.userApiClient.getUsersPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserResponsePagingResponse) => {
          this.items = response.results
          this.totalCount = response.rowCount
          if (selectionId != null && this.items.length > 0) {
            this.selectedItems = this.items.filter(
              (x) => x.id == selectionId
            )
          }
          this.isLoading = false
        },
        error: (error) => {
          this.isLoading = false
          this.alertService.showError(error)
        },
      })
  }

  pageChanged(event: any): void {
    this.pageIndex = event.page
    this.pageSize = event.rows
    this.getData()
  }

  showAddModal(): void {
    const ref = this.dialogService.open(UserDetailComponent, {
      header: 'Add user',
      width: '40%',
    })

    ref.onClose.subscribe((data: UserResponse) => {
      if (data) {
        this.alertService.showSuccess(
          Message.CREATED_OK_MSG
        )
        this.selectedItems = []
        this.getData()
      }
    })
  }

  showEditModal(): void {
    if (this.selectedItems.length == 0) {
      this.alertService.showError(
        Message.NOT_CHOOSE_ANY_RECORD
      )
      return
    }
    var id = this.selectedItems[0].id
    const ref = this.dialogService.open(UserDetailComponent, {
      data: {
        id: id,
      },
      header: 'Update user',
      width: '40%',
    })

    ref.onClose.subscribe((data: UserResponse) => {
      if (data) {
        this.alertService.showSuccess(
          Message.UPDATED_OK_MSG
        )
        this.selectedItems = []
        this.getData(data.id)
      }
    })
  }

  deleteItems() {
    if (this.selectedItems.length == 0) {
      this.alertService.showError(
        Message.NOT_CHOOSE_ANY_RECORD
      )
      return
    }
    var ids = []
    this.selectedItems.forEach((element) => {
      ids.push(element.id)
    })
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: Message.CONFIRM_DELETE_MSG,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.deleteItemsConfirm(ids)
      },
    })
  }

  deleteItemsConfirm(ids: any[]) {
    this.isLoading = true
    this.userApiClient.deleteUsers(ids).subscribe({
      next: () => {
        this.alertService.showSuccess(
          Message.DELETED_OK_MSG
        )
        this.getData()
        this.selectedItems = []
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  setPassword(id: string, userName: string) {
    const ref = this.dialogService.open(SetPasswordComponent, {
      data: {
        id: id,
      },
      header: `Set password for ${userName}`,
      width: '30%',
    })

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.alertService.showSuccess(
          Message.CHANGE_PASSWORD_SUCCCESS_MSG
        )
        this.selectedItems = []
        this.getData()
      }
    })
  }

  changeEmail(id: string) {
    const ref = this.dialogService.open(ChangeEmailComponent, {
      data: {
        id: id,
      },
      header: 'Change email',
      width: '30%',
    })

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.alertService.showSuccess(
          Message.CHANGE_EMAIL_SUCCCESS_MSG
        )
        this.selectedItems = []
        this.getData()
      }
    })
  }

  assignRole(id: string) {
    const ref = this.dialogService.open(RoleAssignComponent, {
      data: {
        id: id,
      },
      header: 'Role Assign',
      width: '60%',
    })

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.alertService.showSuccess(
          Message.ROLE_ASSIGN_SUCCESS_MSG
        )
        this.getData()
      }
    })
  }
}
