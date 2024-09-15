import { ValidateMessageComponent } from 'src/app/shared/validates/validate-message/validate-message.component';
import { AdminApiRoleApiClient, RoleDto } from 'src/app/api/admin-api.service.generated';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { UtilityService } from 'src/app/shared/services/utility.service';
import { PanelModule } from 'primeng/panel'
import { KeyFilterModule } from 'primeng/keyfilter';
import { BlockUIModule } from 'primeng/blockui'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-roles-detail',
  templateUrl: './roles-detail.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PanelModule,
    InputTextModule,
    KeyFilterModule,
    BlockUIModule,
    ProgressSpinnerModule,
    ValidateMessageComponent],
  providers: [
    UtilityService
  ]
})
export class RolesDetailComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  // Default
  public isLoading: boolean = false;
  public form: FormGroup;
  public title: string;
  public btnDisabled = false;
  public saveBtnName: string;
  public closeBtnName: string;
  selectedEntity = {} as RoleDto;

  formSavedEventEmitter: EventEmitter<any> = new EventEmitter();

  // Validate
  noSpecial: RegExp = /^[^<>*!_~]+$/;
  validationMessages = {
    name: [
      { type: 'required', message: 'You must enter a permission name' },
      { type: 'minlength', message: 'You must enter at least 3 characters' },
      { type: 'maxlength', message: 'You cannot enter more than 255 characters' },
    ],
    displayName: [{ type: 'required', message: 'You must enter a display name' }],
  };

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private roleService: AdminApiRoleApiClient,
    private utilService: UtilityService,
    private fb: FormBuilder
  ) { }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close()
    }
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  ngOnInit() {
    this.buildForm();
    if (!this.utilService.isEmpty(this.config.data?.id)) {
      this.loadDetail(this.config.data.id);
      this.saveBtnName = 'Update';
      this.closeBtnName = 'Close';
    } else {
      this.saveBtnName = 'Add';
      this.closeBtnName = 'Close';
    }
  }

  buildForm() {
    this.form = this.fb.group({
      name: new FormControl(
        this.selectedEntity.name || null,
        Validators.compose([
          Validators.required,
          Validators.maxLength(255),
          Validators.minLength(3),
        ])
      ),
      displayName: new FormControl(
        this.selectedEntity.displayName || null,
        Validators.required
      ),
    });
  }

  loadDetail(id: any) {
    // Prevent
    this.loading(true)

    // Call api
    this.roleService.getRoleById(id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: RoleDto) => {
          this.selectedEntity = response;
          this.buildForm();

          // Prevent
          this.loading(false)
        },
        error: () => {
          this.loading(false)
        },
      });
  }

  save() {
    this.loading(true)
    if (this.utilService.isEmpty(this.config.data?.id)) {
      this.roleService.createRole(this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.ref.close(this.form.value);
          this.loading(false);
        });
    } else {
      this.roleService.updateRole(this.config.data.id, this.form.value)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.loading(false);
          this.ref.close(this.form.value);
        });
    }
  }

  private loading(enable: boolean) {
    this.isLoading = enable
    this.btnDisabled = enable
  }
}
