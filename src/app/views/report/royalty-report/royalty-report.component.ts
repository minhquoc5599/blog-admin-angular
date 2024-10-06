import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ConfirmationService } from 'primeng/api'
import { ButtonModule } from 'primeng/button'
import { CalendarModule } from 'primeng/calendar'
import { InputTextModule } from 'primeng/inputtext'
import { PaginatorModule } from 'primeng/paginator'
import { PanelModule } from 'primeng/panel'
import { TableModule } from 'primeng/table'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiRoyaltyApiClient, RoyaltyReportResponse, RoyaltyReportResponsePagingResponse } from 'src/app/api/admin-api.service.generated'
import { Message } from 'src/app/shared/constants/message.constant'
import { PermissionDirective } from 'src/app/shared/directives/permission.directive'
import { AlertService } from 'src/app/shared/services/alert.service'

@Component({
  selector: 'app-royalty-report',
  standalone: true,
  imports: [
    PanelModule,
    ButtonModule,
    TableModule,
    CommonModule,
    FormsModule,
    CalendarModule,
    InputTextModule,
    PaginatorModule,
    PermissionDirective
  ],
  providers: [AdminApiRoyaltyApiClient],
  templateUrl: './royalty-report.component.html',
})
export class RoyaltyReportComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Page Setting
  pageIndex: number = 1
  pageSize: number = 10
  totalCount: number

  // Default
  items: RoyaltyReportResponse[] = []
  username: string = ''
  toDate: Date = new Date()
  fromDate: Date = new Date(new Date().setDate(this.toDate.getDate() - 7))

  constructor(
    private alertService: AlertService,
    private confirmationService: ConfirmationService,

    // Api
    private royaltyApiClient: AdminApiRoyaltyApiClient
  ) { }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  ngOnInit(): void {
    this.getData()
  }

  getData(): void {
    const fromDateFormat = this.formatDate(this.fromDate)
    const toDateFormat = this.formatDate(this.toDate)
    this.royaltyApiClient.getRoyaltyReport(this.username, fromDateFormat, toDateFormat)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: RoyaltyReportResponsePagingResponse) => {
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

  private formatDate(date: Date): string {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return [date.getFullYear(), (month > 9 ? '' : '0') + month, (day > 9 ? '' : '0') + day].join('-')
  }

  payForUser(id: string): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: Message.CONFIRM_PAY_MSG,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.payConfirm(id)
      }
    })
  }

  private payConfirm(id: string): void {
    this.royaltyApiClient.payRoyalty(id)
      .subscribe({
        next: () => {
          this.alertService.showSuccess(Message.UPDATED_OK_MSG)
          this.getData()
        },
        error: () => { }
      })
  }
}
