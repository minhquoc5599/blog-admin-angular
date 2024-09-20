import { formatDate } from '@angular/common'
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { DomSanitizer } from '@angular/platform-browser'
import { BlockUIModule } from 'primeng/blockui'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { ImageModule } from 'primeng/image'
import { InputTextModule } from 'primeng/inputtext'
import { KeyFilterModule } from 'primeng/keyfilter'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { forkJoin, Subject, takeUntil } from 'rxjs'
import { AdminApiRoleApiClient, AdminApiUserApiClient, RoleResponse, UserResponse } from 'src/app/api/admin-api.service.generated'
import { AlertService } from 'src/app/shared/services/alert.service'
import { UtilityService } from 'src/app/shared/services/utility.service'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    BlockUIModule,
    ProgressSpinnerModule,
    CheckboxModule,
    KeyFilterModule,
    ImageModule,
    ButtonModule,
    ValidateMessageComponent
  ],
  providers: [
    AdminApiRoleApiClient,
    AdminApiUserApiClient,
    UtilityService
  ]
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()

  // Default
  public isLoading: boolean = false
  public form: FormGroup
  public btnDisabled = false
  public saveBtnName: string
  public roles: any[] = []
  selectedEntity = {} as UserResponse
  public avatarImage
  formSavedEventEmitter: EventEmitter<any> = new EventEmitter()

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/
  validationMessages = {
    fullName: [{ type: 'required', message: 'You must enter a name' }],
    email: [{ type: 'required', message: 'You must enter a email' }],
    userName: [{ type: 'required', message: 'You must enter a username' }],
    password: [
      { type: 'required', message: 'You must enter a password' },
      {
        type: 'pattern',
        message: 'Password must be at least 8 characters, at least 1 number, 1 special character, and one uppercase letter',
      },
    ],
    phoneNumber: [{ type: 'required', message: 'You must enter a phone number' }],
  }

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private utilityService: UtilityService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private alertService: AlertService,

    // Api
    private userApiClient: AdminApiUserApiClient,
    private roleApiClient: AdminApiRoleApiClient,
  ) { }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close()
    }
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()

  }

  ngOnInit(): void {
    //Init form
    this.buildForm()
    //Load data to form
    var roles = this.roleApiClient.getAllRoles()
    this.loading(true)
    forkJoin({
      roles
    })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (repsonse: any) => {
          //Push categories to dropdown list
          var roles = repsonse.roles as RoleResponse[]
          roles.forEach(element => {
            this.roles.push({
              value: element.id,
              label: element.name,
            })
          })

          if (!this.utilityService.isEmpty(this.config.data?.id)) {
            this.loadFormDetails(this.config.data?.id)
          } else {
            this.setMode('create')
            this.loading(false)
          }
        },
        error: () => {
          this.loading(false)
        },
      })
    this.cd.detectChanges()
  }

  buildForm() {
    this.form = this.fb.group({
      firstName: new FormControl(this.selectedEntity.firstName || null, Validators.required),
      lastName: new FormControl(this.selectedEntity.lastName || null, Validators.required),
      userName: new FormControl(this.selectedEntity.userName || null, Validators.required),
      email: new FormControl(this.selectedEntity.email || null, Validators.required),
      phoneNumber: new FormControl(this.selectedEntity.phoneNumber || null, Validators.required),
      password: new FormControl(
        null,
        Validators.compose([
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}$'
          ),
        ])
      ),
      dob: new FormControl(
        this.selectedEntity.dob ? formatDate(this.selectedEntity.dob, 'yyyy-MM-dd', 'en') : null
      ),
      avatarFile: new FormControl(null),
      avatar: new FormControl(this.selectedEntity.avatar || null),
      isActive: new FormControl(this.selectedEntity.isActive || true),
    })
  }

  setMode(mode: string) {
    if (mode == 'update') {
      this.form.controls['userName'].clearValidators()
      this.form.controls['userName'].disable()
      this.form.controls['email'].clearValidators()
      this.form.controls['email'].disable()
      this.form.controls['password'].clearValidators()
      this.form.controls['password'].disable()
    } else if (mode == 'create') {
      this.form.controls['userName'].addValidators(Validators.required)
      this.form.controls['userName'].enable()
      this.form.controls['email'].addValidators(Validators.required)
      this.form.controls['email'].enable()
      this.form.controls['password'].addValidators(Validators.required)
      this.form.controls['password'].enable()
    }
  }

  loadFormDetails(id: string) {
    this.userApiClient
      .getUserById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserResponse) => {
          this.selectedEntity = response
          this.buildForm()
          this.setMode('update')

          this.loading(false)
        },
        error: () => {
          this.loading(false)
        },
      })
  }

  onFileChange(event) {
    const reader = new FileReader()

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.form.patchValue({
          avatarFileName: file.name,
          avatarFileContent: reader.result,
        })

        // need to run CD since file load runs outside of zone
        this.cd.markForCheck()
      }
    }
  }

  save() {
    this.loading(true)
    if (this.utilityService.isEmpty(this.config.data?.id)) {
      this.userApiClient
        .createUser(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.ref.close(this.form.value)
            this.loading(false)
          },
          error: (error) => {
            this.loading(false)
            this.alertService.showError(error)
          },
        })
    } else {
      this.userApiClient
        .updateUser(this.config.data?.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.loading(false)

            this.ref.close(this.form.value)
          },
          error: (error) => {
            this.loading(false)
            this.alertService.showError(error)
          },
        })
    }
  }

  private loading(enable: boolean) {
    this.isLoading = enable
    this.btnDisabled = enable
  }
}
