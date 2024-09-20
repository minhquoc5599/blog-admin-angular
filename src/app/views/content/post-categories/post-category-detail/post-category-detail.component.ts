import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from '@coreui/angular'
import { BlockUIModule } from 'primeng/blockui'
import { CheckboxModule } from 'primeng/checkbox'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { KeyFilterModule } from 'primeng/keyfilter'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiPostCategoryApiClient, PostCategoryResponse } from 'src/app/api/admin-api.service.generated'
import { AlertService } from 'src/app/shared/services/alert.service'
import { UtilityService } from 'src/app/shared/services/utility.service'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'

@Component({
  selector: 'app-post-category-detail',
  templateUrl: './post-category-detail.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    BlockUIModule,
    ProgressSpinnerModule,
    CheckboxModule,
    KeyFilterModule,
    ButtonModule,
    ValidateMessageComponent
  ],
  providers: [
    UtilityService
  ]
})
export class PostCategoryDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  public isLoading: boolean = false
  public form: FormGroup
  public btnDisabled = false
  public saveBtnName: string
  selectedEntity = {} as PostCategoryResponse

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
    'sortOrder': [
      { type: 'required', message: 'You must enter the order' }
    ]
  }

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private utilityService: UtilityService,
    private fb: FormBuilder,
    private alertService: AlertService,

    // Api
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
    this.buildForm()
    if (this.utilityService.isEmpty(this.config.data?.id) == false) {
      this.loadDetail(this.config.data.id)
      this.saveBtnName = 'Update'
    } else {
      this.saveBtnName = 'Add'
    }
  }

  public generateSlug() {
    var slug = this.utilityService.makeSeoTitle(this.form.get('name').value);
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
      sortOrder: new FormControl(this.selectedEntity.sortOrder || 0, Validators.required),
      isActive: new FormControl(this.selectedEntity.isActive || true),
      seoDescription: new FormControl(this.selectedEntity.seoDescription || null),
    })
  }

  loadDetail(id: any) {
    this.loading(true)
    this.postCategoryApiClient.getPostCategoryById(id)
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

  save() {
    this.loading(true)
    if (this.utilityService.isEmpty(this.config.data?.id)) {
      this.postCategoryApiClient.createPostCategory(this.form.value)
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
      this.postCategoryApiClient.updatePostCategory(this.config.data.id, this.form.value)
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
