import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextModule } from 'primeng/inputtext'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { KeyFilterModule } from 'primeng/keyfilter'
import { Subject, takeUntil } from 'rxjs'
import { AdminApiPostCategoryApiClient, PostCategoryResponse } from 'src/app/api/admin-api.service.generated'
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
    CheckboxModule,
    KeyFilterModule,
    ButtonModule,
    ValidateMessageComponent
  ],
  providers: [
    UtilityService
  ]
})
export class PostCategoryDetailComponent implements OnInit, AfterContentInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  private timeoutId: number
  // Default
  form: FormGroup
  btnDisabled = false
  saveBtnName: string
  private selectedEntity = {} as PostCategoryResponse

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
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private utilityService: UtilityService,
    private fb: FormBuilder,

    // Api
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
      if (this.utilityService.isEmpty(this.config.data?.id) == false) {
        this.loadDetail(this.config.data.id)
        this.saveBtnName = 'Update'
      } else {
        this.saveBtnName = 'Add'
      }
    }, 0)
  }

  generateSlug(): void {
    var slug = this.utilityService.makeSeoTitle(this.form.get('name').value);
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
      sortOrder: new FormControl(this.selectedEntity.sortOrder || 0, Validators.required),
      isActive: new FormControl(this.selectedEntity.isActive || true),
      seoDescription: new FormControl(this.selectedEntity.seoDescription || null),
    })
  }

  private loadDetail(id: any): void {
    this.postCategoryApiClient.getPostCategoryById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: PostCategoryResponse) => {
          this.selectedEntity = response
          this.buildForm()
        }
        , error: () => { }
      })
  }

  save(): void {
    this.btnDisabled = true
    if (this.utilityService.isEmpty(this.config.data?.id)) {
      this.postCategoryApiClient.createPostCategory(this.form.value)
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
      this.postCategoryApiClient.updatePostCategory(this.config.data.id, this.form.value)
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
