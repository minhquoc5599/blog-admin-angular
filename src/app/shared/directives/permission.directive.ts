import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { StorageService } from './../services/storage.service';

@Directive({
  selector: '[appPermission]',
  standalone: true
})
export class PermissionDirective implements OnInit {
  @Input() appPolicy: string

  constructor(private el: ElementRef, private storageService: StorageService) { }

  ngOnInit(): void {
    var loggedInUser = this.storageService.getUser()
    if (loggedInUser) {
      var listPermission = loggedInUser.permissions
      if (listPermission != null && listPermission != '' && listPermission.filter((x: string) => x === this.appPolicy).length > 0) {
        this.el.nativeElement.style.display = ''
      } else {
        this.el.nativeElement.style.display = 'none'
      }
    }
    else {
      this.el.nativeElement.style.display = 'none'
    }
  }
}
