import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
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
import {
  AdminApiPostCategoryApiClient,
  PostCategoryResponse,
  PostCategoryResponsePagingResponse
} from 'src/app/api/admin-api.service.generated'
import { Message } from 'src/app/shared/constants/message.constant'
import { AlertService } from 'src/app/shared/services/alert.service'
import { PostCategoryDetailComponent } from './post-category-detail/post-category-detail.component'

@Component({
  selector: 'app-post-category',
  templateUrl: './post-category.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ProgressSpinnerModule,
    BlockUIModule,
    PaginatorModule,
    PanelModule,
    InputTextModule,
    ButtonModule,
    BadgeModule
  ],
  providers: [
    DialogService,
    AdminApiPostCategoryApiClient
  ]
})
export class PostCategoryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  isLoading: boolean = true

  // Page Setting
  pageIndex: number = 1
  pageSize: number = 10
  totalCount: number

  //Business variables
  items: PostCategoryResponse[]
  selectedItems: PostCategoryResponse[] = []
  keyword: string = ''

  constructor(
    public dialogService: DialogService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,

    // Api
    private postCategoryApiClient: AdminApiPostCategoryApiClient
  ) { }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  ngOnInit(): void {
    this.getData()
  }

  getData(): void {
    this.isLoading = true

    this.postCategoryApiClient.getPostCategoriesPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostCategoryResponsePagingResponse) => {
          this.items = response.results
          this.totalCount = response.rowCount

          this.isLoading = false
        },
        error: (error) => {
          this.isLoading = false
          this.alertService.showError(error)
        }
      })
  }

  pageChanged(event: any): void {
    this.pageIndex = event.page
    this.pageSize = event.rows
    this.getData()
  }

  showAddModal(): void {
    const ref = this.dialogService.open(PostCategoryDetailComponent, {
      header: 'Add Post Category',
      width: '40%'
    })
    
    ref.onClose.subscribe((data: PostCategoryResponse) => {
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
    const ref = this.dialogService.open(PostCategoryDetailComponent, {
      data: {
        id: id
      },
      header: 'Update post category',
      width: '40%'
    })
   
    ref.onClose.subscribe((data: PostCategoryResponse) => {
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

  deleteItemsConfirm(ids: any[]) {
    this.isLoading = true

    this.postCategoryApiClient.deletePostCategory(ids)
      .subscribe({
        next: () => {
          this.alertService.showSuccess(Message.DELETED_OK_MSG)
          this.getData()
          this.selectedItems = []
          this.isLoading = false
        },
        error: () => {
          this.isLoading = false
        }
      })
  }
}
