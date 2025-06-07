// app.routes.ts
import { Routes } from '@angular/router';
import { ContactsListComponent } from './contacts/contacts-list/contacts-list.component';
import { CreateContactComponent } from './contacts/create-contact/create-contact.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/contacts', 
    pathMatch: 'full' 
  },
  { 
    path: 'contacts', 
    component: ContactsListComponent,
    data: { title: 'Contact List' }
  },
  { 
    path: 'contacts/add', 
    component: CreateContactComponent,
    data: { title: 'Add New Contact', mode: 'add' }
  },
  { 
    path: 'contacts/edit/:id', 
    component: CreateContactComponent,
    data: { title: 'Edit Contact', mode: 'edit' }
  },
  { 
    path: '**', 
    redirectTo: '/contacts' 
  }
];