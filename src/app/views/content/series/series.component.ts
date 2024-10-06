import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { ConfirmationService } from 'primeng/api'
import { BadgeModule } from 'primeng/badge'
import { ButtonModule } from 'primeng/button'
import { DialogService } from 'primeng/dynamicdialog'
import { InputTextModule } from 'primeng/inputtext'
import { PaginatorModule } from 'primeng/paginator'
import { PanelModule } from 'primeng/panel'
import { TableModule } from 'primeng/table'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiSeriesApiClient, SeriesResponse, SeriesResponsePagingResponse } from 'src/app/api/admin-api.service.generated'
import { Message } from 'src/app/shared/constants/message.constant'
import { PermissionDirective } from 'src/app/shared/directives/permission.directive'
import { AlertService } from 'src/app/shared/services/alert.service'
import { SeriesDetailComponent } from './series-detail/series-detail.component'
import { SeriesPostsComponent } from './series-posts/series-posts.component'

@Component({
  selector: 'app-series',
  templateUrl: './series.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    PanelModule,
    InputTextModule,
    ButtonModule,
    BadgeModule,
    PermissionDirective
  ],
  providers: [
    DialogService,
    AdminApiSeriesApiClient
  ]
})
export class SeriesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Page Setting
  pageIndex: number = 1
  pageSize: number = 10
  totalCount: number

  //Business variables
  items: SeriesResponse[]
  selectedItems: SeriesResponse[] = []
  keyword: string = ''

  constructor(
    private dialogService: DialogService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,

    // Api
    private seriesApiClient: AdminApiSeriesApiClient,
  ) { }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  ngOnInit(): void {
    this.getData()
  }

  getData(): void {
    this.seriesApiClient.getSeriesPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: SeriesResponsePagingResponse) => {
          this.items = response.results
          this.totalCount = response.rowCount
        }
        ,
        error: () => { }
      })
  }

  pageChanged(event: any): void {
    this.pageIndex = event.page + 1
    this.pageSize = event.rows
    this.getData()
  }

  showAddModal(): void {
    const ref = this.dialogService.open(SeriesDetailComponent, {
      header: 'Add series',
      width: '40%'
    })

    ref.onClose.subscribe((data: SeriesResponse) => {
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
    const ref = this.dialogService.open(SeriesDetailComponent, {
      data: {
        id: id
      },
      header: 'Update series',
      width: '40%'
    })

    ref.onClose.subscribe((data: SeriesResponse) => {
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
    this.seriesApiClient.deleteSeries(ids)
      .subscribe({
        next: () => {
          this.alertService.showSuccess(Message.DELETED_OK_MSG)
          this.getData()
          this.selectedItems = []
        },
        error: () => { }
      })
  }

  showPosts(): void {
    if (this.selectedItems.length == 0) {
      this.alertService.showError(Message.NOT_CHOOSE_ANY_RECORD)
      return
    }
    var id = this.selectedItems[0].id
    const ref = this.dialogService.open(SeriesPostsComponent, {
      data: {
        id: id
      },
      header: 'Post list',
      width: '70%'
    })

    ref.onClose.subscribe((data: SeriesResponse) => {
      if (data) {
        this.alertService.showSuccess(Message.UPDATED_OK_MSG)
        this.selectedItems = []
        this.getData()
      }
    })
  }
}
