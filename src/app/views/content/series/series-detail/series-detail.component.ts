import { CommonModule } from '@angular/common'
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from '@coreui/angular'
import { BlockUIModule } from 'primeng/blockui'
import { CheckboxModule } from 'primeng/checkbox'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { EditorModule } from 'primeng/editor'
import { ImageModule } from 'primeng/image'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { KeyFilterModule } from 'primeng/keyfilter'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiSeriesApiClient, PostCategoryResponse, SeriesDetailResponse } from 'src/app/api/admin-api.service.generated'
import { UploadApiService } from 'src/app/api/upload-api.service'
import { AlertService } from 'src/app/shared/services/alert.service'
import { UtilityService } from 'src/app/shared/services/utility.service'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'
import { environment } from 'src/enviroments/environment'

@Component({
  selector: 'app-series-detail',
  templateUrl: './series-detail.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    BlockUIModule,
    ProgressSpinnerModule,
    CheckboxModule,
    KeyFilterModule,
    ButtonModule,
    ImageModule,
    EditorModule,
    ValidateMessageComponent
  ],
  providers: [
    UtilityService
  ]
})
export class SeriesDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  isLoading: boolean = false
  form: FormGroup
  btnDisabled = false
  saveBtnName: string
  postCategories: any[] = []
  contentTypes: any[] = []
  series: any[] = []
  selectedEntity = {} as SeriesDetailResponse
  thumbnailImage

  formSavedEventEmitter: EventEmitter<any> = new EventEmitter()

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/
  validationMessages = {
    'name': [
      { type: 'required', message: 'You must enter name' },
      { type: 'minlength', message: 'You must enter at least 3 characters' },
      { type: 'maxlength', message: 'You cannot enter more than 255 characters' }
    ],
    'slug': [
      { type: 'required', message: 'You must enter a unique code' }
    ],
    'description': [
      { type: 'required', message: 'You must enter description' }
    ]
  }

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private utilityService: UtilityService,
    private fb: FormBuilder,
    private alertService: AlertService,

    // Api
    private uploadApiService: UploadApiService,
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
    this.buildForm()
    if (this.utilityService.isEmpty(this.config.data?.id) == false) {
      this.loadDetail(this.config.data.id)
      this.saveBtnName = 'Update'
    } else {
      this.saveBtnName = 'Add'
    }
  }

  generateSlug() {
    var slug = this.utilityService.makeSeoTitle(this.form.get('name').value)
    this.form.controls['slug'].setValue(slug)
  }

  buildForm() {
    this.form = this.fb.group({
      name: new FormControl(this.selectedEntity.name || null, Validators.compose([
        Validators.required,
        Validators.maxLength(255),
        Validators.minLength(3)
      ])),
      slug: new FormControl(this.selectedEntity.slug || null, Validators.required),
      description: new FormControl(this.selectedEntity.description || null, Validators.required),
      seoDescription: new FormControl(this.selectedEntity.seoDescription || null),
      content: new FormControl(this.selectedEntity.content || null),
      isActive: new FormControl(this.selectedEntity.isActive || null),
      thumbnail: new FormControl(
        this.selectedEntity.thumbnail || null
      ),
    })
    if (this.selectedEntity.thumbnail) {
      this.thumbnailImage = environment.API_URL + this.selectedEntity.thumbnail
    }
  }

  loadDetail(id: any) {
    this.loading(true)
    this.seriesApiClient.getSeriesById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostCategoryResponse) => {
          this.selectedEntity = response
          this.buildForm()
          this.loading(false)

        }
        , error: () => {
          this.loadDetail(false)
        }
      })
  }

  onFileChange(event) {
    if (event.target.files && event.target.files.length) {
      this.uploadApiService.uploadImage('posts', event.target.files)
        .subscribe({
          next: (response: any) => {
            this.form.controls['thumbnail'].setValue(response.path)
            this.thumbnailImage = environment.API_URL + response.path
          },
          error: (error: any) => {
            this.alertService.showError(error)
          }
        })
    }
  }

  save() {
    this.loading(true)
    if (this.utilityService.isEmpty(this.config.data?.id)) {
      this.seriesApiClient.createSeries(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form.value)
            this.loading(false)

          }, error: (error) => {
            this.loading(false)
            this.alertService.showError(error)
          }
        })
    }
    else {
      this.seriesApiClient.updateSeries(this.config.data.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.loading(false)
            this.ref.close(this.form.value)
          }, error: (error) => {
            this.loading(false)
            this.alertService.showError(error)
          }
        })
    }
  }

  private loading(enable: boolean) {
    this.isLoading = enable
    this.btnDisabled = enable
  }
}
