import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { BadgeModule } from 'primeng/badge'
import { ButtonModule } from 'primeng/button'
import { CalendarModule } from 'primeng/calendar'
import { InputTextModule } from 'primeng/inputtext'
import { PaginatorModule } from 'primeng/paginator'
import { PanelModule } from 'primeng/panel'
import { TableModule } from 'primeng/table'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiRoyaltyApiClient, TransactionResponse, TransactionResponsePagingResponse } from 'src/app/api/admin-api.service.generated'
import { PermissionDirective } from 'src/app/shared/directives/permission.directive'

@Component({
  selector: 'app-transactions',
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
    BadgeModule,
    PermissionDirective
  ],
  providers: [AdminApiRoyaltyApiClient],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Page Setting
  pageIndex: number = 1
  pageSize: number = 10
  totalCount: number

  // Default
  items: TransactionResponse[] = []
  username: string = ''
  toDate: Date = new Date()
  fromDate: Date = new Date(new Date().setDate(this.toDate.getDate() - 7))

  constructor(
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
    this.royaltyApiClient.getTransactions(this.username, fromDateFormat, toDateFormat)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: TransactionResponsePagingResponse) => {
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
}
