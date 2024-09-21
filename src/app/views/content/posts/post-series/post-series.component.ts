import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { BlockUIModule } from 'primeng/blockui'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { DropdownModule } from 'primeng/dropdown'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextModule } from 'primeng/inputtext'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { TableModule } from 'primeng/table'
import { TooltipModule } from 'primeng/tooltip'
import { Subject, takeUntil } from 'rxjs'
import { AddPostSeriesRequest, AdminApiPostApiClient, AdminApiSeriesApiClient, PostDetailResponse, SeriesResponse } from 'src/app/api/admin-api.service.generated'
import { Message } from 'src/app/shared/constants/message.constant'
import { AlertService } from 'src/app/shared/services/alert.service'
import { UtilityService } from 'src/app/shared/services/utility.service'

@Component({
  selector: 'app-post-series',
  templateUrl: './post-series.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    BlockUIModule,
    ProgressSpinnerModule,
    CheckboxModule,
    ButtonModule,
    DropdownModule,
    TableModule,
    TooltipModule
  ],
  providers: [
    UtilityService,
    AdminApiSeriesApiClient
  ]
})
export class PostSeriesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  isLoading: boolean = false
  form: FormGroup
  btnDisabled = false
  postSeries: any[] = []
  series: any[] = []
  contentTypes: any[] = []
  selectedEntity = {} as PostDetailResponse

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/
  validationMessages = {
    seriesId: [{ type: 'required', message: 'You must choose series' }],
    sortOrder: [{ type: 'required', message: 'You must enter the order' }]
  }

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private utilityService: UtilityService,
    private fb: FormBuilder,
    private alertService: AlertService,

    // Api
    private postApiClient: AdminApiPostApiClient,
    private seriesApiClient: AdminApiSeriesApiClient
  ) { }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close()
    }
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  ngOnInit() {
    this.loading(true)
    this.buildForm()
    this.loadSeries();
    if (this.utilityService.isEmpty(this.config.data?.id) == false) {
      this.loadPostSeries(this.config.data.id)
    } else {
      this.loading(false)
    }
    this.loading(false)
  }

  buildForm() {
    this.form = this.fb.group({
      seriesId: new FormControl(null, Validators.required),
      sortOrder: new FormControl(0, Validators.required),
    })
  }

  loadSeries(): void {
    this.seriesApiClient.getAllSeries()
      .subscribe((response: SeriesResponse[]) => {
        response.forEach(item => {
          this.series.push({
            value: item.id,
            label: item.name
          })
        })
      })
  }

  loadPostSeries(id: any) {
    this.postApiClient.getSeries(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: SeriesResponse[]) => {
          this.postSeries = response
        }
        , error: () => {
        }
      })
  }

  addPostToSeries(): void {
    this.loading(true);
    var body: AddPostSeriesRequest = new AddPostSeriesRequest({
      postId: this.config.data.id,
      seriesId: this.form.controls['seriesId'].value,
      sortOrder: this.form.controls['sortOrder'].value
    });
    this.seriesApiClient.addPostSeries(body)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(Message.POST_ADDED_TO_SERIES_SUCCESS_MSG);
          this.loadPostSeries(this.config.data?.id);
          this.loading(false);
        },
        error: () => {
          this.loading(false);
        },
      });
  }

  removeSeries(id: string): void {
    this.loading(true);
    var body: AddPostSeriesRequest = new AddPostSeriesRequest({
      postId: this.config.data.id,
      seriesId: id
    });
    this.seriesApiClient.deletePostSeries(body)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.alertService.showSuccess(Message.DELETED_OK_MSG);
          this.loadPostSeries(this.config.data?.id);
          this.loading(false);
        },
        error: () => {
          this.loading(false);
        },
      });
  }

  private loading(enable: boolean) {
    this.isLoading = enable
    this.btnDisabled = enable
  }
}
