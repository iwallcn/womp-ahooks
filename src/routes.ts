import BasicLayout from '@/layouts/BasicLayout';
import { children } from './routerConfig';
import Home from '@/pages/Home';
import Services from '@/pages/Services';

const routerConfig = [
  {
    path: '/',
    component: BasicLayout,
    children: [
      ...children,
      {
        path: '/services',
        component: Services,
      },
      {
        path: '/home',
        component: Home,
      },
      {
        path: '/',
        redirect: '/home',
      },]
  },
];

export default routerConfig;