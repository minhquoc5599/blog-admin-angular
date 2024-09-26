import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    attributes: {
      policyName: 'Permissions.Dashboard.View'
    }
  },
  {
    name: 'System',
    url: '/system',
    iconComponent: { name: 'cil-settings' },
    attributes: {
      policyName: 'Permissions.System.View'
    },
    children: [
      {
        name: 'Roles',
        url: '/system/roles',
        icon: 'nav-icon-bullet',
        attributes: {
          policyName: 'Permissions.Roles.View'
        }
      },
      {
        name: 'Users',
        url: '/system/users',
        icon: 'nav-icon-bullet',
        attributes: {
          policyName: 'Permissions.Users.View'
        }
      },
    ]
  },
  {
    name: 'Content',
    url: '/content',
    iconComponent: { name: 'cil-pencil' },
    attributes: {
      policyName: 'Permissions.Content.View'
    },
    children: [
      {
        name: 'Categories',
        url: '/content/post-categories',
        icon: 'nav-icon-bullet',
        attributes: {
          policyName: 'Permissions.PostCategories.View'
        }
      },
      {
        name: 'Posts',
        url: '/content/posts',
        icon: 'nav-icon-bullet',
        attributes: {
          policyName: 'Permissions.Posts.View'
        }
      },
      {
        name: 'Series',
        url: '/content/series',
        icon: 'nav-icon-bullet',
        attributes: {
          policyName: 'Permissions.Series.View'
        }
      }
    ]
  },
  {
    name: 'Report',
    url: '/report',
    iconComponent: { name: 'cil-description' },
    attributes: {
      policyName: 'Permissions.Report.View'
    },
    children: [
      {
        name: 'Royalty report',
        url: '/report/royalty-report',
        icon: 'nav-icon-bullet',
        attributes: {
          "policyName": "Permissions.Royalty.GetRoyaltyReport"
        }
      },
      {
        name: 'Transactions',
        url: '/report/transactions',
        icon: 'nav-icon-bullet',
        attributes: {
          "policyName": "Permissions.Royalty.GetTransactions"
        }
      }
    ],
  },
];
