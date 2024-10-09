import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { AutoCompleteModule } from 'primeng/autocomplete'
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
import { Subject, takeUntil } from 'rxjs'
import { AdminApiPostApiClient, AdminApiPostCategoryApiClient, PostDetailResponse } from 'src/app/api/admin-api.service.generated'
import { UploadApiService } from 'src/app/api/upload-api.service'
import { UtilityService } from 'src/app/shared/services/utility.service'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'
import { environment } from 'src/enviroments/environment'
interface AutoCompleteCompleteEvent {
  originalEvent: Event
  query: string
}

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
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
    DropdownModule,
    AutoCompleteModule,
    ValidateMessageComponent
  ],
  providers: [
    UtilityService
  ]
})
export class PostDetailComponent implements OnInit, AfterContentInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  private timeoutId: number

  // Default
  form: FormGroup
  btnDisabled = false
  saveBtnName: string
  postCategories: any[] = []
  series: any[] = []
  selectedEntity = {} as PostDetailResponse
  thumbnailImage: any

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

  // Tags
  tags: string[] | undefined
  filteredTags: string[] | undefined
  postTags: string[]

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private utilityService: UtilityService,
    private fb: FormBuilder,

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

    clearTimeout(this.timeoutId)
  }

  ngOnInit(): void {
    this.buildForm()
  }

  ngAfterContentInit(): void {
    this.timeoutId = setTimeout(() => {
      this.loadTags()
      this.loadPostCategories()
      if (this.utilityService.isEmpty(this.config.data?.id) == false) {
        this.postApiClient.getTagsByPostId(this.config.data.id)
          .subscribe((response: string[]) => {
            this.postTags = response
            this.loadDetail(this.config.data.id)
          })

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
      categoryId: new FormControl(this.selectedEntity.categoryId || null, Validators.required),
      description: new FormControl(this.selectedEntity.description || null, Validators.required),
      seoDescription: new FormControl(this.selectedEntity.seoDescription || null),
      tags: new FormControl(this.postTags),
      content: new FormControl(this.selectedEntity.content || null),
      thumbnail: new FormControl(this.selectedEntity.thumbnail || null),
    })
    if (this.selectedEntity.thumbnail) {
      this.thumbnailImage = environment.API_URL + this.selectedEntity.thumbnail
    }
  }

  private loadTags(): void {
    this.postApiClient.getTags()
      .subscribe((response: string[]) => {
        this.tags = response
      })
  }

  private loadPostCategories(): void {
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

  private loadDetail(id: any): void {
    this.postApiClient.getPostById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostDetailResponse) => {
          this.selectedEntity = response
          this.buildForm()
        },
        error: () => { }
      })
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.uploadApiService.uploadImage('posts', event.target.files)
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
      this.postApiClient.createPost(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.btnDisabled = false
            this.ref.close(this.form.value)
          },
          error: () => {
            this.btnDisabled = false
          }
        })
    }
    else {
      this.postApiClient.updatePost(this.config.data.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.btnDisabled = false
            this.ref.close(this.form.value)
          },
          error: () => {
            this.btnDisabled = false
          }
        })
    }
  }

  filterTag(event: AutoCompleteCompleteEvent): void {
    let filtered: string[] = []
    let query = event.query

    for (let i = 0; i < (this.tags as string[]).length; i++) {
      let tag = (this.tags as string[])[i]
      if (tag.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(tag)
      }
    }

    if (filtered.length === 0) {
      filtered.push(query)
    }

    this.filteredTags = filtered
  }
}
