import { Url } from 'src/app/shared/constants/url.constant';
import { StorageService } from 'src/app/shared/services/storage.service';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
@Injectable()
export class AuthGuard {

  constructor(private router: Router, private storage: StorageService) {

  }

  canActivate(actionRoute: ActivatedRouteSnapshot, routerState: RouterStateSnapshot): boolean {
    let requiredPolicy = actionRoute.data['requiredPolicy'] as string
    let loggedInUser = this.storage.getUser();
    if (loggedInUser) {
      let listPermission = JSON.parse(loggedInUser.permissions);
      if (listPermission != null && listPermission != '' && listPermission.filter((x: any) => x === requiredPolicy).length > 0) {
        return true
      } else {
        this.router.navigate([Url.ACCESS_DENIED], {
          queryParams: {
            returnUrl: routerState.url
          }
        });
        return false
      }
    } else {
      this.router.navigate([Url.LOGIN], {
        queryParams: {
          returnUrl: routerState.url
        }
      });
      return false
    }
  }
}
