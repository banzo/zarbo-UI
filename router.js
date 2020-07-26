import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

const page = (path) => () =>
  import(`~/pages/${path}`).then((m) => m.default || m)

const routes = [
  { path: '/', name: 'index', component: page('Index.vue') },
  {
    path: '/login',
    name: 'login',
    component: page('auth/Login.vue'),
  },
  {
    path: '/verification/verify/:id',
    name: 'verify',
    component: page('auth/verification/Verify.vue'),
  },
  {
    path: '/password/reset/:token',
    name: 'password.reset',
    component: page('auth/password/PasswordReset.vue'),
  },
  {
    path: '/upload',
    name: 'designs.upload',
    component: page('user/designs/Create.vue'),
  },
  {
    path: '/designs/:id/edit',
    name: 'designs.edit',
    component: page('user/designs/Edit.vue'),
  },
  {
    path: '/settings',
    component: page('user/settings/Index.vue'),
    children: [
      { path: '', redirect: { name: 'settings.dashboard' } },
      {
        path: 'dashboard',
        name: 'settings.dashboard',
        component: page('user/settings/Dashboard.vue'),
      },
      {
        path: 'profile',
        name: 'settings.profile',
        component: page('user/settings/Profile.vue'),
      },
      {
        path: 'designs',
        name: 'settings.designs',
        component: page('user/settings/Designs.vue'),
      },
    ],
  },
  /*  {
    path: '/upload',
    name: 'designs.upload',
    component: page('user/designs/CreatePage.vue'),
    meta: {
      showModal: true,
    },
  }, */

  {
    path: '/test',
    name: 'test',
    component: page('test.vue'),
    meta: {
      layout: 'default-2',
    },
  },
]

export function createRouter() {
  return new Router({
    routes,
    mode: 'history',
  })
}