import { AuthGuard } from 'src/app/shared/guards/auth.guard';
import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'posts',
    pathMatch: 'full',
  },
  {
    path: 'posts',
    loadComponent: () => import('./posts/post.component').then(m => m.PostComponent),
    data: {
      title: 'Posts',
      requiredPolicy: 'Permissions.Posts.View'
    },
    canActivate: [AuthGuard]
  },
]
