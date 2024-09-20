import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { BadgeModule } from 'primeng/badge'
import { BlockUIModule } from 'primeng/blockui'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
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
    BlockUIModule,
    ProgressSpinnerModule,
    BadgeModule,
  ]
})
export class PostActivityLogsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  isLoading: boolean = false
  items: PostActivityLogResponse[] = []

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,

    // Api
    private postApiClient: AdminApiPostApiClient,
  ) { }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.getData(this.config.data?.id)
  }

  getData(id: string) {
    this.isLoading = true

    this.postApiClient.getPostActivityLogs(this.config.data.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (repsonse: PostActivityLogResponse[]) => {
          this.items = repsonse;
          this.isLoading = false
        },
        error: () => {
          this.isLoading = false
        },
      });
  }
}
