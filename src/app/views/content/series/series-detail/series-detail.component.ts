import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { EditorModule } from 'primeng/editor'
import { ImageModule } from 'primeng/image'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { KeyFilterModule } from 'primeng/keyfilter'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiSeriesApiClient, PostCategoryResponse, SeriesDetailResponse } from 'src/app/api/admin-api.service.generated'
import { UploadApiService } from 'src/app/api/upload-api.service'
import { UtilityService } from 'src/app/shared/services/utility.service'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'
import { environment } from 'src/enviroments/environment'

@Component({
  selector: 'app-series-detail',
  templateUrl: './series-detail.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
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
export class SeriesDetailComponent implements OnInit, AfterContentInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  private timeoutId: number

  // Default
  form: FormGroup
  btnDisabled = false
  saveBtnName: string
  postCategories: any[] = []
  contentTypes: any[] = []
  series: any[] = []
  selectedEntity = {} as SeriesDetailResponse
  thumbnailImage: any

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
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private utilityService: UtilityService,
    private fb: FormBuilder,

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

    clearTimeout(this.timeoutId)
  }

  ngOnInit(): void {
    this.buildForm()

  }

  ngAfterContentInit(): void {
    this.timeoutId = setTimeout(() => {
      if (this.utilityService.isEmpty(this.config.data?.id) == false) {
        this.loadDetail(this.config.data.id)
        this.saveBtnName = 'Update'
      } else {
        this.saveBtnName = 'Add'
      }
    }, 0)
  }

  generateSlug(): void {
    var slug = this.utilityService.makeSeoTitle(this.form.get('name').value)
    this.form.controls['slug'].setValue(slug)
  }

  private buildForm(): void {
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
      thumbnail: new FormControl(this.selectedEntity.thumbnail || null),
    })
    if (this.selectedEntity.thumbnail) {
      this.thumbnailImage = environment.API_URL + this.selectedEntity.thumbnail
    }
  }

  private loadDetail(id: any): void {
    this.seriesApiClient.getSeriesById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostCategoryResponse) => {
          this.selectedEntity = response
          this.buildForm()
        }
        , error: () => { }
      })
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.uploadApiService.uploadImage('series', event.target.files)
        .subscribe({
          next: (response: any) => {
            this.form.controls['thumbnail'].setValue(response.path)
            this.thumbnailImage = environment.API_URL + response.path
          },
          error: () => { }
        })
    }
  }

  save(): void {
    this.btnDisabled = true
    if (this.utilityService.isEmpty(this.config.data?.id)) {
      this.seriesApiClient.createSeries(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.btnDisabled = false
            this.ref.close(this.form.value)

          }, error: () => {
            this.btnDisabled = false
          }
        })
    }
    else {
      this.seriesApiClient.updateSeries(this.config.data.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.btnDisabled = false
            this.ref.close(this.form.value)
          }, error: () => {
            this.btnDisabled = false
          }
        })
    }
  }
}
