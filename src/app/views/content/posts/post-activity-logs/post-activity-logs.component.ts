import { CommonModule } from '@angular/common'
import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core'
import { BadgeModule } from 'primeng/badge'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { TableModule } from 'primeng/table'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiPostApiClient, PostActivityLogResponse } from 'src/app/api/admin-api.service.generated'

@Component({
  selector: 'app-post-activity-logs',
  templateUrl: './post-activity-logs.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    BadgeModule,
  ]
})
export class PostActivityLogsComponent implements OnInit, AfterContentInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  private timeoutId: number

  // Default
  items: PostActivityLogResponse[] = []

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    // Api
    private postApiClient: AdminApiPostApiClient,
  ) { }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    clearTimeout(this.timeoutId)
  }

  ngOnInit(): void { }

  ngAfterContentInit(): void {
    this.timeoutId = setTimeout(() => {
      this.getData()
    }, 0)
  }

  private getData(): void {
    this.postApiClient.getPostActivityLogs(this.config.data.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (repsonse: PostActivityLogResponse[]) => {
          this.items = repsonse;
        },
        error: () => { },
      });
  }
}
