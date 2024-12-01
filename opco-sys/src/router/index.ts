import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/LoginPage.vue'
import Home from '../views/Dashboard.vue'
import ManagePlot from '../views/ManagePlot.vue'
import Interment from '../views/Interment.vue'
import AboutUs from '../components/AboutUs.vue'
import Settings from '../components/Settings.vue'
import Generate from '../views/GenerateRep.vue'
import RequestNewPassword from '../views/RequestNewPassword.vue'
import DataIndex from '../views/DataIndex.vue'
import ProfileUser from '../components/ProfileForm.vue'
import AccountProfile from '@/views/AccountProfile.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'login' }
    },
    {
      path: '/dashboard',
      name: 'home',
      component: Home
    },
    {
      path: '/data-index',
      name: 'data-index',
      component: DataIndex
    },
    {
      path: '/about-us',
      name: 'aboutUs',
      component: AboutUs
    },
    
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: '/request-new-password',
      name: 'requestNewPassword',
      component: RequestNewPassword
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/generate',
      name: 'generate',
      component: Generate
    },
    {
      path: '/interment',
      name: 'interment',
      component: Interment
    },
    {
      path: '/manage-plot',
      name: 'managePlot',
      component: ManagePlot
    },
    {
      path: '/profile-user',
      name: 'profileUser',
      component: ProfileUser
    },
    {
      path: '/account-profile',
      name: 'accountProfile',
      component: AccountProfile
    },


  ]
})

export default router
