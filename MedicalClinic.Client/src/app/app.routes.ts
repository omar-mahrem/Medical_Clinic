import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { DoctorsListComponent } from './features/doctors/doctors-list.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { MyAppointmentsComponent } from './features/patient/appointments/my-appointments.component';
import { MyRecordsComponent } from './features/patient/records/my-records.component';
import { DoctorDashboardComponent } from './features/doctor/dashboard/doctor-dashboard.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { ProfileComponent } from './features/account/profile/profile.component';
import { AccountSetupComponent } from './features/account/setup/account-setup.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'doctors',
    component: DoctorsListComponent
  },
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: 'auth/forgetPassword',
    component: LoginComponent
  },
  {
    path: 'auth/forgot-password',
    component: LoginComponent
  },
  {
    path: 'auth/reset-password',
    component: LoginComponent
  },
  {
    path: 'auth/register',
    component: RegisterComponent
  },
  {
    path: 'patient/appointments',
    component: MyAppointmentsComponent,
    canActivate: [authGuard, roleGuard(['Patient', 'Admin'])]
  },
  {
    path: 'patient/records',
    component: MyRecordsComponent,
    canActivate: [authGuard, roleGuard(['Patient', 'Admin'])]
  },
  {
    path: 'doctor/dashboard',
    component: DoctorDashboardComponent,
    canActivate: [authGuard, roleGuard(['Doctor', 'Admin'])]
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard(['Admin', 'Receptionist'])]
  },
  {
    path: 'account/profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'account/setup',
    component: AccountSetupComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
