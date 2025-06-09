// app.routes.ts
import { Routes } from '@angular/router';
import { ContactsListComponent } from './contacts/contacts-list/contacts-list.component';
import { CreateContactComponent } from './contacts/create-contact/create-contact.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/contacts', 
    pathMatch: 'full' 
  },
  { 
    path: 'contacts', 
    component: ContactsListComponent,
    canActivate: [AuthGuard] ,
    data: { title: 'Contact List' }
  },
  { 
    path: 'contacts/add', 
    canActivate: [AuthGuard] ,
    component: CreateContactComponent,
    data: { title: 'Add New Contact', mode: 'add' }
  },
  { 
    path: 'contacts/edit/:id', 
    component: CreateContactComponent,
    data: { title: 'Edit Contact', mode: 'edit' }
  },
  { 
    path: 'login', 
    component: LoginComponent,
    data: { title: 'Login', mode: 'edit' }
  },
  { 
    path: '**', 
    redirectTo: '/contacts' 
  }
];