import { RoleAssignComponent } from './role-assign/role-assign.component'
import { ChangeEmailComponent } from './change-email/change-email.component'
import { SetPasswordComponent } from './set-password/set-password.component'
import { UserDetailComponent } from './user-detail/user-detail.component'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { ConfirmationService } from 'primeng/api'
import { DialogService, DynamicDialogComponent } from 'primeng/dynamicdialog'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiUserApiClient, UserResponse, UserResponsePagingResponse } from 'src/app/api/admin-api.service.generated'
import { AlertService } from 'src/app/shared/services/alert.service'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { InputTextModule } from 'primeng/inputtext'
import { TableModule } from 'primeng/table'
import { PanelModule } from 'primeng/panel'
import { BadgeModule } from 'primeng/badge'
import { PaginatorModule } from 'primeng/paginator'
import { BlockUIModule } from 'primeng/blockui'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { ButtonModule } from 'primeng/button'
import { Message } from 'src/app/shared/constants/message.constant'

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
  public isLoading: boolean = false

  //Page setting
  public pageIndex: number = 1
  public pageSize: number = 10
  public totalCount: number

  //Business variables
  public items: UserResponse[]
  public selectedItems: UserResponse[] = []
  public keyword: string = ''

  constructor(
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    public dialogService: DialogService,

    //Api
    private userService: AdminApiUserApiClient,
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
    this.userService
      .getUsersPaging(this.keyword, this.pageIndex, this.pageSize)
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
        error: () => {
          this.isLoading = false
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
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref)
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy()
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy
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
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref)
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy()
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy
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
    this.userService.deleteUsers(ids).subscribe({
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
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref)
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy()
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy
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
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref)
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy()
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy
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
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref)
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy()
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy
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
