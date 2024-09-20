import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { ButtonModule } from '@coreui/angular'
import { BlockUIModule } from 'primeng/blockui'
import { CheckboxModule } from 'primeng/checkbox'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { KeyFilterModule } from 'primeng/keyfilter'
import { PanelModule } from 'primeng/panel'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
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
    PanelModule,
    TableModule,
    BlockUIModule,
    ProgressSpinnerModule,
    CheckboxModule,
    KeyFilterModule,
    ButtonModule,
    ValidateMessageComponent
  ],
  providers: [
  ]
})
export class SeriesPostsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  isLoading: boolean = false
  posts: PostResponse[] = []


  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private alertService: AlertService,

    // Api
    private seriesApiClient: AdminApiSeriesApiClient
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

    this.seriesApiClient.getPostsInSeries(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostResponse[]) => {
          this.posts = response;
          this.isLoading = false
        },
        error: (error) => {
          this.isLoading = false
        }
      }
      );
  }

  removePost(id: string) {
    var body: AddPostSeriesRequest = new AddPostSeriesRequest({
      postId: id,
      seriesId: this.config.data.id
    });
    this.isLoading = true
    this.seriesApiClient
      .deletePostSeries(body)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(Message.DELETED_OK_MSG);
          this.getData(this.config.data?.id);
          this.isLoading = false
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
}
