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
  {
    path: 'post-categories',
    loadComponent: () => import('./post-categories/post-category.component').then(m => m.PostCategoryComponent),
    data: {
      title: 'PostCategories',
      requiredPolicy: 'Permissions.PostCategories.View'
    },
    canActivate: [AuthGuard]
  },
  {
    path: 'series',
    loadComponent: () => import('./series/series.component').then(m => m.SeriesComponent),
    data: {
      title: 'Series',
      requiredPolicy: 'Permissions.Series.View'
    },
    canActivate: [AuthGuard]
  },
]
