import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW'
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
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Posts',
        url: '/content/posts',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Series',
        url: '/content/series',
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Royalty',
        url: '/content/royalty',
        icon: 'nav-icon-bullet'
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
        icon: 'nav-icon-bullet'
      },
      {
        name: 'Users',
        url: '/system/users',
        icon: 'nav-icon-bullet'
      },
    ]
  },
];
