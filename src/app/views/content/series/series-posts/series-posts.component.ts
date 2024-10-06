import { CommonModule } from '@angular/common'
import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { KeyFilterModule } from 'primeng/keyfilter'
import { TableModule } from 'primeng/table'
import { Subject, takeUntil } from 'rxjs'
import { AddPostSeriesRequest, AdminApiSeriesApiClient, PostResponse, } from 'src/app/api/admin-api.service.generated'
import { Message } from 'src/app/shared/constants/message.constant'
import { AlertService } from 'src/app/shared/services/alert.service'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'

@Component({
  selector: 'app-series-posts',
  templateUrl: './series-posts.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CheckboxModule,
    KeyFilterModule,
    ButtonModule,
    ValidateMessageComponent
  ]
})
export class SeriesPostsComponent implements OnInit, AfterContentInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  private timeoutId: number

  // Default
  posts: PostResponse[] = []

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private alertService: AlertService,

    // Api
    private seriesApiClient: AdminApiSeriesApiClient
  ) { }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close()
    }
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()

    clearTimeout(this.timeoutId)
  }

  ngOnInit(): void { }

  ngAfterContentInit(): void {
    this.timeoutId = setTimeout(() => {
      this.getData(this.config.data?.id)
    }, 0)
  }

  private getData(id: string): void {
    this.seriesApiClient.getPostsInSeries(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostResponse[]) => {
          this.posts = response
        },
        error: () => { }
      })
  }

  removePost(id: string): void {
    var body: AddPostSeriesRequest = new AddPostSeriesRequest({
      postId: id,
      seriesId: this.config.data.id
    })
    this.seriesApiClient.deletePostSeries(body)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(Message.DELETED_OK_MSG)
          this.getData(this.config.data?.id)
        },
        error: () => { },
      })
  }
}
