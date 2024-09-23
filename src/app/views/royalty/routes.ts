import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'transactions',
    pathMatch: 'full',
  },
  {
    path: 'royalty-report',
    loadComponent: () => import('./royalty-report/royalty-report.component').then(m => m.RoyaltyReportComponent),
    data: {
      title: 'RoyaltyReport',
      requiredPolicy: 'Permissions.Royalty.GetRoyaltyReport'
    },
    canActivate: [AuthGuard]
  },
  {
    path: 'transactions',
    loadComponent: () => import('./transactions/transactions.component').then(m => m.TransactionsComponent),
    data: {
      title: 'Transactions',
      requiredPolicy: 'Permissions.Royalty.GetTransactions'
    },
    canActivate: [AuthGuard]
  },
]
