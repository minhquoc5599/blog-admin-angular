import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ConfirmationService } from 'primeng/api'
import { BadgeModule } from 'primeng/badge'
import { ButtonModule } from 'primeng/button'
import { DropdownModule } from 'primeng/dropdown'
import { DialogService } from 'primeng/dynamicdialog'
import { InputTextModule } from 'primeng/inputtext'
import { PaginatorModule } from 'primeng/paginator'
import { PanelModule } from 'primeng/panel'
import { TableModule } from 'primeng/table'
import { TooltipModule } from 'primeng/tooltip'
import { Subject, takeUntil } from 'rxjs'
import {
  AdminApiPostApiClient,
  AdminApiPostCategoryApiClient,
  PostCategoryResponse,
  PostDetailResponse,
  PostResponsePagingResponse
} from 'src/app/api/admin-api.service.generated'
import { Message } from 'src/app/shared/constants/message.constant'
import { PermissionDirective } from 'src/app/shared/directives/permission.directive'
import { AlertService } from 'src/app/shared/services/alert.service'
import { PostActivityLogsComponent } from './post-activity-logs/post-activity-logs.component'
import { PostDetailComponent } from './post-detail/post-detail.component'
import { PostRejectReasonComponent } from './post-reject-reason/post-reject-reason.component'
import { PostSeriesComponent } from './post-series/post-series.component'

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DropdownModule,
    TableModule,
    PaginatorModule,
    PanelModule,
    InputTextModule,
    ButtonModule,
    BadgeModule,
    TooltipModule,
    PermissionDirective
  ],
  providers: [
    DialogService,
    AdminApiPostCategoryApiClient,
    AdminApiPostApiClient
  ]
})
export class PostComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Page Setting
  pageIndex: number = 1
  pageSize: number = 10
  totalCount: number

  //Business variables
  items: PostCategoryResponse[]
  selectedItems: PostCategoryResponse[] = []
  keyword: string = ''

  postCategoryId?: string = null
  postCategories: any[] = []

  constructor(
    private dialogService: DialogService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,

    // Api
    private postApiClient: AdminApiPostApiClient,
    private postCategoryApiClient: AdminApiPostCategoryApiClient
  ) { }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  ngOnInit(): void {
    this.getPostCategories()
    this.getData()
  }

  getPostCategories(): void {
    this.postCategoryApiClient.getPostCategories()
      .subscribe((response: PostDetailResponse[]) => {
        response.forEach(item => {
          this.postCategories.push({
            value: item.id,
            label: item.name
          })
        })
      })
  }

  getData(): void {
    this.postApiClient.getPostsPaging(this.keyword, this.postCategoryId, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostResponsePagingResponse) => {
          this.items = response.results
          this.totalCount = response.rowCount
        },
        error: () => { }
      })
  }

  pageChanged(event: any): void {
    this.pageIndex = event.page + 1
    this.pageSize = event.rows
    this.getData()
  }

  showAddModal(): void {
    const ref = this.dialogService.open(PostDetailComponent, {
      header: 'Add Post',
      width: '40%'
    })

    ref.onClose.subscribe((data: PostDetailResponse) => {
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
    const ref = this.dialogService.open(PostDetailComponent, {
      data: {
        id: id
      },
      header: 'Update post',
      width: '40%'
    })

    ref.onClose.subscribe((data: PostDetailResponse) => {
      if (data) {
        this.alertService.showSuccess(Message.UPDATED_OK_MSG)
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
    this.selectedItems.forEach(element => {
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
      }
    })
  }

  private deleteItemsConfirm(ids: any[]): void {
    this.postApiClient.deletePosts(ids)
      .subscribe({
        next: () => {
          this.alertService.showSuccess(Message.DELETED_OK_MSG)
          this.getData()
          this.selectedItems = []
        },
        error: () => { }
      })
  }

  showAddPostToSeriesModal(id: string, name: string): void {
    const ref = this.dialogService.open(PostSeriesComponent, {
      data: {
        id: id
      },
      header: `Add ${name} to series`,
      width: '50%'
    })

    ref.onClose.subscribe((data: PostDetailResponse) => {
      if (data) {
        this.alertService.showSuccess(Message.UPDATED_OK_MSG)
        this.selectedItems = []
        this.getData()
      }
    })
  }

  approve(id: string): void {
    this.postApiClient.approvePost(id).subscribe({
      next: () => {
        this.alertService.showSuccess(Message.UPDATED_OK_MSG)
        this.getData()
        this.selectedItems = []
      },
      error: () => { }
    })
  }

  sendToApprove(id: string): void {
    this.postApiClient.sendToApprove(id).subscribe({
      next: () => {
        this.alertService.showSuccess(Message.UPDATED_OK_MSG)
        this.getData()
        this.selectedItems = []
      },
      error: () => { }
    })
  }

  reject(id: string, name: string): void {
    const ref = this.dialogService.open(PostRejectReasonComponent, {
      data: {
        id: id
      },
      header: `Reject post for ${name}`,
      width: '40%'
    })

    ref.onClose.subscribe((data: any) => {
      if (data) {
        this.alertService.showSuccess(Message.UPDATED_OK_MSG)
        this.selectedItems = []
        this.getData()
      }
    })
  }

  showPostActivityLogs(id: string, name: string): void {
    const ref = this.dialogService.open(PostActivityLogsComponent, {
      data: {
        id: id
      },
      header: `Post Activity Logs for ${name}`,
      width: '70%'
    })

    ref.onClose.subscribe((data: any) => {
      if (data) {
        this.alertService.showSuccess(Message.UPDATED_OK_MSG)
        this.selectedItems = []
        this.getData()
      }
    })
  }
}
