import { SeriesPostsComponent } from './series-posts/series-posts.component';
import { SeriesDetailComponent } from './series-detail/series-detail.component';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { AdminApiSeriesApiClient, SeriesResponse, SeriesResponsePagingResponse } from 'src/app/api/admin-api.service.generated';
import { Message } from 'src/app/shared/constants/message.constant';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-series',
  templateUrl: './series.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    BlockUIModule,
    ProgressSpinnerModule,
    PaginatorModule,
    PanelModule,
    InputTextModule,
    ButtonModule,
    BadgeModule
  ],
  providers: [
    DialogService,
    AdminApiSeriesApiClient
  ]
})
export class SeriesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  public isLoading: boolean = true

  // Page Setting
  public pageIndex: number = 1
  public pageSize: number = 10
  public totalCount: number

  //Business variables
  public items: SeriesResponse[]
  public selectedItems: SeriesResponse[] = []
  public keyword: string = ''

  constructor(
    public dialogService: DialogService,
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

  getData(selectionId = null) {
    this.isLoading = true;

    this.seriesApiClient.getSeriesPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: SeriesResponsePagingResponse) => {
          this.items = response.results;
          this.totalCount = response.rowCount;
          this.isLoading = false;
        }
        ,
        error: (error) => {
          this.isLoading = false;
          this.alertService.showError(error)
        }
      });
  }

  pageChanged(event: any): void {
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.getData();
  }

  showAddModal(): void {
    const ref = this.dialogService.open(SeriesDetailComponent, {
      header: 'Add series',
      width: '40%'
    });

    ref.onClose.subscribe((data: SeriesResponse) => {
      if (data) {
        this.alertService.showSuccess(Message.CREATED_OK_MSG);
        this.selectedItems = [];
        this.getData();
      }
    });
  }

  showEditModal(): void {
    if (this.selectedItems.length == 0) {
      this.alertService.showError(Message.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    var id = this.selectedItems[0].id;
    const ref = this.dialogService.open(SeriesDetailComponent, {
      data: {
        id: id
      },
      header: 'Update series',
      width: '40%'
    });

    ref.onClose.subscribe((data: SeriesResponse) => {
      if (data) {
        this.alertService.showSuccess(Message.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.getData(data.id);
      }
    });
  }

  deleteItems() {
    if (this.selectedItems.length == 0) {
      this.alertService.showError(Message.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    var ids = [];
    this.selectedItems.forEach(element => {
      ids.push(element.id);
    });
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: Message.CONFIRM_DELETE_MSG,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.deleteItemsConfirm(ids)
      }
    });
  }

  deleteItemsConfirm(ids: any[]) {
    this.isLoading = true;

    this.seriesApiClient.deleteSeries(ids)
      .subscribe({
        next: () => {
          this.alertService.showSuccess(Message.DELETED_OK_MSG);
          this.getData();
          this.selectedItems = [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  showPosts(): void {
    if (this.selectedItems.length == 0) {
      this.alertService.showError(Message.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    var id = this.selectedItems[0].id;
    const ref = this.dialogService.open(SeriesPostsComponent, {
      data: {
        id: id
      },
      header: 'Post list',
      width: '70%'
    });
    
    ref.onClose.subscribe((data: SeriesResponse) => {
      if (data) {
        this.alertService.showSuccess(Message.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.getData(data.id);
      }
    });
  }

}
