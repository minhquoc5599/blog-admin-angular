import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW'
    },
    attributes: {
      policyName: 'Permissions.Dashboard.View'
    }
  },
  {
    name: 'Content',
    url: '/content',
    iconComponent: { name: 'cil-puzzle' },
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
        attributes:{
          policyName: 'Permissions.Series.View'
        }
      },
      {
        name: 'Royalty',
        url: '/content/royalty',
        icon: 'nav-icon-bullet',
        attributes:{
          policyName: 'Permissions.Royalty.View'
        }
      },
    ]
  },
  {
    name: 'System',
    url: '/system',
    iconComponent: { name: 'cil-notes' },
    children: [
      {
        name: 'Roles',
        url: '/system/roles',
        icon: 'nav-icon-bullet',
        attributes:{
          policyName: 'Permissions.Roles.View'
        }
      },
      {
        name: 'Users',
        url: '/system/users',
        icon: 'nav-icon-bullet',
        attributes:{
          policyName: 'Permissions.Users.View'
        }
      },
    ]
  },
];
