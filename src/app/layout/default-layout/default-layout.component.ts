import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { Url } from 'src/app/shared/constants/url.constant';
import { StorageService } from 'src/app/shared/services/storage.service';
import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems } from './_nav';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    RouterLink,
    IconDirective,
    NgScrollbar,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    DefaultHeaderComponent,
    ShadowOnScrollDirective,
    ContainerComponent,
    RouterOutlet,
    DefaultFooterComponent
  ]
})
export class DefaultLayoutComponent implements OnInit {
  public navItems = [];

  constructor(private storage: StorageService, private router: Router) {

  }

  ngOnInit(): void {
    let user = this.storage.getUser()
    if (user == null) this.router.navigate([Url.LOGIN])
    let permissions = JSON.parse(user?.permissions)
    for (let i = 0; i < navItems.length; i++) {
      for (let child = 0; child < navItems[i].children?.length; child++) {
        if (navItems[i].children[child].attributes
          && permissions.filter((p: string) => p === navItems[i].children[child].attributes['policyName']).length === 0) {
          navItems[i].children[child].class = 'hidden'
        }
      }
    }
    this.navItems = navItems
  }

  onScrollbarUpdate($event: any) {
    // if ($event.verticalUsed) {
    // console.log('verticalUsed', $event.verticalUsed);
    // }
  }
}
