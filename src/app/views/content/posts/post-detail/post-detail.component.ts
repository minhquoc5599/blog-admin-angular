import { CommonModule } from '@angular/common'
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { BlockUIModule } from 'primeng/blockui'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { DropdownModule } from 'primeng/dropdown'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { EditorModule } from 'primeng/editor'
import { ImageModule } from 'primeng/image'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { KeyFilterModule } from 'primeng/keyfilter'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiPostApiClient, AdminApiPostCategoryApiClient, PostDetailResponse } from 'src/app/api/admin-api.service.generated'
import { UploadApiService } from 'src/app/api/upload-api.service'
import { AlertService } from 'src/app/shared/services/alert.service'
import { UtilityService } from 'src/app/shared/services/utility.service'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'
import { environment } from 'src/enviroments/environment'

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
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
    DropdownModule,
    ValidateMessageComponent
  ],
  providers: [
    UtilityService
  ]
})
export class PostDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  isLoading: boolean = false
  form: FormGroup
  btnDisabled = false
  saveBtnName: string
  postCategories: any[] = []
  series: any[] = []
  selectedEntity = {} as PostDetailResponse
  thumbnailImage: any

  formSavedEventEmitter: EventEmitter<any> = new EventEmitter()

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/
  validationMessages = {
    name: [
      { type: 'required', message: 'You must enter name' },
      { type: 'minlength', message: 'You must enter at least 3 characters' },
      { type: 'maxlength', message: 'You cannot enter more than 255 characters' }
    ],
    slug: [{ type: 'required', message: 'You must enter a unique code' }],
    description: [{ type: 'required', message: 'You must enter description' }]
  }

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private utilityService: UtilityService,
    private fb: FormBuilder,
    private alertService: AlertService,

    // Api
    private uploadApiService: UploadApiService,
    private postApiClient: AdminApiPostApiClient,
    private postCategoryApiClient: AdminApiPostCategoryApiClient
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
    this.loadPostCategories();
    if (this.utilityService.isEmpty(this.config.data?.id) == false) {
      this.loadDetail(this.config.data.id)
      this.saveBtnName = 'Update'
    } else {
      this.saveBtnName = 'Add'
    }
    this.loading(false)
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
      categoryId: new FormControl(this.selectedEntity.categoryId || null, Validators.required),
      description: new FormControl(this.selectedEntity.description || null, Validators.required),
      seoDescription: new FormControl(this.selectedEntity.seoDescription || null),
      tags: new FormControl(this.selectedEntity.tags || null),
      content: new FormControl(this.selectedEntity.content || null),
      thumbnail: new FormControl(this.selectedEntity.thumbnail || null),
    })
    if (this.selectedEntity.thumbnail) {
      this.thumbnailImage = environment.API_URL + this.selectedEntity.thumbnail
    }
  }

  loadPostCategories(): void {
    this.postCategoryApiClient.getPostCategories()
      .subscribe((response: PostDetailResponse[]) => {
        response.forEach(item => {
          this.postCategories.push({
            value: item.id,
            label: item.name
          })
        })
      })
  }

  loadDetail(id: any) {
    this.postApiClient.getPostById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostDetailResponse) => {
          this.selectedEntity = response
          this.buildForm()

        }
        , error: () => {
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
      this.postApiClient.createPost(this.form.value)
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
      this.postApiClient.updatePost(this.config.data.id, this.form.value)
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
