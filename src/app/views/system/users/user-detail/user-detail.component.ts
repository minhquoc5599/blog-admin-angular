import { formatDate } from '@angular/common'
import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule } from 'primeng/checkbox'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { ImageModule } from 'primeng/image'
import { InputNumberModule } from 'primeng/inputnumber'
import { InputTextModule } from 'primeng/inputtext'
import { KeyFilterModule } from 'primeng/keyfilter'
import { forkJoin, Subject, takeUntil } from 'rxjs'
import { AdminApiRoleApiClient, AdminApiUserApiClient, RoleResponse, UserResponse } from 'src/app/api/admin-api.service.generated'
import { UploadApiService } from 'src/app/api/upload-api.service'
import { UtilityService } from 'src/app/shared/services/utility.service'
import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component'
import { environment } from 'src/enviroments/environment'

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    KeyFilterModule,
    ImageModule,
    ButtonModule,
    ValidateMessageComponent
  ],
  providers: [
    AdminApiRoleApiClient,
    UtilityService
  ]
})
export class UserDetailComponent implements OnInit, AfterContentInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  private timeoutId: number

  // Default
  form: FormGroup
  btnDisabled = false
  saveBtnName: string
  roles: any[] = []
  selectedEntity = {} as UserResponse
  avatarImage: any

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
    royaltyAmountPerPost: [{ type: 'required', message: 'You must enter a royalty amount' }],
  }

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private utilityService: UtilityService,
    private fb: FormBuilder,

    // Api
    private userApiClient: AdminApiUserApiClient,
    private roleApiClient: AdminApiRoleApiClient,
    private uploadApiService: UploadApiService,
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
      //Load data to form
      var roles = this.roleApiClient.getAllRoles()
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
            }
          },
          error: () => { },
        })
    }, 0)
  }

  private buildForm(): void {
    this.form = this.fb.group({
      userName: new FormControl(this.selectedEntity.userName || null, Validators.required),
      firstName: new FormControl(this.selectedEntity.firstName || null, Validators.required),
      lastName: new FormControl(this.selectedEntity.lastName || null, Validators.required),
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
      avatar: new FormControl(this.selectedEntity.avatar || null),
      isActive: new FormControl(this.selectedEntity.isActive || true),
      royaltyAmountPerPost: new FormControl(this.selectedEntity.royaltyAmountPerPost || 0, Validators.required)
    })
    if (this.selectedEntity.avatar) {
      this.avatarImage = environment.API_URL + this.selectedEntity.avatar
    }
  }

  private setMode(mode: string): void {
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

  private loadFormDetails(id: string): void {
    this.userApiClient
      .getUserById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: UserResponse) => {
          this.selectedEntity = response
          this.buildForm()
          this.setMode('update')
        },
        error: () => { },
      })
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.uploadApiService.uploadImage('users', event.target.files)
        .subscribe({
          next: (response: any) => {
            this.form.controls['avatar'].setValue(response.path)
            this.avatarImage = environment.API_URL + response.path
          },
          error: () => { }
        })
    }
  }

  save(): void {
    this.btnDisabled = true
    if (this.utilityService.isEmpty(this.config.data?.id)) {
      this.userApiClient
        .createUser(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.btnDisabled = false
            this.ref.close(this.form.value)
          },
          error: () => {
            this.btnDisabled = false
          },
        })
    } else {
      this.userApiClient
        .updateUser(this.config.data?.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.btnDisabled = false
            this.ref.close(this.form.value)
          },
          error: () => {
            this.btnDisabled = false
          },
        })
    }
  }
}
