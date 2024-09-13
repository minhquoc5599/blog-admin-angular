import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  },
  {
    path: 'users',
    loadComponent: () => import('./users/user.component').then(m => m.UserComponent),
    data: {
      title: 'Users',
      requiredPolicy: 'Permissions.Users.View'
    },
    canActivate: [AuthGuard]
  },
  {
    path: 'roles',
    loadComponent: () => import('./roles/role.component').then(m => m.RoleComponent),
    data: {
      title: 'Roles',
      requiredPolicy: 'Permissions.Roles.View'
    },
    canActivate: [AuthGuard]
  },
]
