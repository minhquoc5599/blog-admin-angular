import { PermissionComponent } from './permission/permission.component'
import { Message } from 'src/app/shared/constants/message.constant'
import { RoleDetailComponent } from './role-detail/role-detail.component'
import { AdminApiRoleApiClient, RoleResponsePagingResponse } from 'src/app/api/admin-api.service.generated'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { Subject, takeUntil } from 'rxjs'
import { RoleResponse } from 'src/app/api/admin-api.service.generated'
import { AlertService } from 'src/app/shared/services/alert.service'
import { DialogService, DynamicDialogComponent } from 'primeng/dynamicdialog'
import { ConfirmationService } from 'primeng/api'
import { TableModule } from 'primeng/table'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { BlockUIModule } from 'primeng/blockui'
import { PaginatorModule } from 'primeng/paginator'
import { PanelModule } from 'primeng/panel'
import { CommonModule } from '@angular/common'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ProgressSpinnerModule,
    BlockUIModule,
    PaginatorModule,
    PanelModule,
    InputTextModule,
    ButtonModule
  ],
  providers: [
    AdminApiRoleApiClient,
    DialogService
  ]
})
export class RoleComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  isLoading: boolean = false

  //Page setting
  pageIndex: number = 1
  pageSize: number = 10
  total: number

  //Query
  data: RoleResponse[]
  selectedItems: RoleResponse[] = []
  keyword: string = ''

  constructor(
    private roleService: AdminApiRoleApiClient,
    private alertService: AlertService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService) { }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  ngOnInit(): void {
    this.getData()
  }

  getData() {
    this.isLoading = true
    this.roleService.getRolesPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: RoleResponsePagingResponse) => {
          this.data = response.results
          this.total = response.rowCount
          this.isLoading = false
        },
        error: (e) => {
          this.isLoading = false
        }
      })
  }

  pageChanged(event: any): void {
    this.pageIndex = event.page
    this.pageSize = event.rows
    this.getData()
  }

  // private loadingUI(enable: boolean) {
  //   if (enable) {
  //     this.isLoading = true 
  //   } else {
  //     setTimeout(() => {
  //       this.isLoading = false
  //     }, 1000)
  //   }
  // }

  showAddModal(): void {
    const ref = this.dialogService.open(RoleDetailComponent, {
      header: 'Add role',
      width: '30%',
    })
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref)
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy()
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy
    ref.onClose.subscribe((data: RoleResponse) => {
      if (data) {
        this.alertService.showSuccess(Message.CREATED_OK_MSG)
        this.selectedItems = []
        this.getData()
      }
    })
  }

  showEditModal(): void {
    if (this.selectedItems.length == 0) {
      this.alertService.showError(Message.NOT_CHOOSE_ANY_RECORD)
      return
    }
    var id = this.selectedItems[0].id
    const ref = this.dialogService.open(RoleDetailComponent, {
      data: {
        id: id,
      },
      header: 'Edit Role',
      width: '30%',
    })
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref)
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy()
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy
    ref.onClose.subscribe((data: RoleResponse) => {
      if (data) {
        this.alertService.showSuccess(Message.UPDATED_OK_MSG)
        this.selectedItems = []
        this.getData()
      }
    })
  }

  showPermissionModal(id: string, name: string): void {
    const ref = this.dialogService.open(PermissionComponent, {
      data: {
        id: id,
      },
      header: `Role permissions for ${name}`,
      width: '50%',
    })
    const dialogRef = this.dialogService.dialogComponentRefMap.get(ref)
    const dynamicComponent = dialogRef?.instance as DynamicDialogComponent
    const ariaLabelledBy = dynamicComponent.getAriaLabelledBy()
    dynamicComponent.getAriaLabelledBy = () => ariaLabelledBy
    ref.onClose.subscribe((data: RoleResponse) => {
      if (data) {
        this.alertService.showSuccess(
          Message.UPDATED_OK_MSG
        )
        this.selectedItems = []
        this.getData()
      }
    })
  }

  deleteItems(): void {
    if (this.selectedItems.length == 0) {
      this.alertService.showError(Message.NOT_CHOOSE_ANY_RECORD)
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

    this.roleService.deleteRoles(ids).subscribe({
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
}
