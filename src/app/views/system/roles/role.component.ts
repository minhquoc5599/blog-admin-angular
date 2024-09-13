import { AdminApiRoleApiClient, RoleDtoPagingResult } from './../../../api/admin-api.service.generated';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { Subject, takeUntil } from 'rxjs';
import { RoleDto } from 'src/app/api/admin-api.service.generated';
import { AlertService } from 'src/app/shared/services/alert.service';
import { DialogService } from 'primeng/dynamicdialog'
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { BlockUIModule } from 'primeng/blockui'
import { PaginatorModule } from 'primeng/paginator'
import { PanelModule } from 'primeng/panel'
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  standalone: true,
  imports: [
    // ContainerComponent,
    // RowComponent,
    // ColComponent,
    // InputGroupComponent,
    // InputGroupTextDirective,
    // IconDirective,
    // FormControlDirective,
    // ButtonDirective,
    CommonModule,
    TableModule,
    ProgressSpinnerModule,
    BlockUIModule,
    PaginatorModule,
    PanelModule,
    InputTextModule,
    ButtonModule
  ],
  providers: [
    AdminApiRoleApiClient,
    DialogService,
    ConfirmationService,
  ]
})
export class RoleComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>()
  isloading: boolean = false

  //Page setting
  pageIndex: number = 1
  pageSize: number = 10
  total: number

  //Query
  data: RoleDto[]
  selectedItems: RoleDto[] = []
  keyword: string = ''

  constructor(
    private roleService: AdminApiRoleApiClient,
    alertService: AlertService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService) { }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
  }

  ngOnInit(): void {
    this.getData()
  }

  getData() {
    this.isloading = true
    this.roleService.getRolesPaging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: RoleDtoPagingResult) => {
          this.data = response.results
          this.total = response.rowCount
          this.isloading = false
        },
        error: (e) => {
          this.isloading = false
        }
      })
  }

  pageChanged(event: any): void {
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.getData();
  }

  // private loadingUI(enable: boolean) {
  //   if (enable) {
  //     this.isloading = true 
  //   } else {
  //     setTimeout(() => {
  //       this.isloading = false
  //     }, 1000)
  //   }
  // }

  showPermissionModal(id: string, name: string): void { }
  showEditModal(): void { }
  showAddModal(): void { }
  deleteItems(): void { }

}
