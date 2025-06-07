import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Contact, ContactService } from '../contact.service';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    PaginatorModule,
    InputTextModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
  ], 
  providers: [ContactService, ConfirmationService, MessageService],
   templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.scss'],
})
export class ContactsListComponent implements OnInit {
  contacts: Contact[] = [];
  displayedContacts: Contact[] = [];
  loading = false;

  // Pagination
  page = 0;
  rows = 5;
  totalRecords = 0;

  // Editing
  editingContactId: number | null = null;
  clonedContacts: { [key: number]: Contact } = {};

  // Filters
  nameFilter: string = '';
  phoneFilter: string = '';
  addressFilter: string = '';

  constructor(
    private contactService: ContactService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading = true;
    this.contactService.getContacts().subscribe((contacts) => {
      this.contacts = contacts;
      this.totalRecords = contacts.length;
      this.updateDisplayedContacts();
      this.loading = false;
    });
  }

  updateDisplayedContacts(): void {
    let filtered = [...this.contacts];

    if (this.nameFilter) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(this.nameFilter.toLowerCase())
      );
    }

    if (this.phoneFilter) {
      filtered = filtered.filter(c =>
        c.phone.toLowerCase().includes(this.phoneFilter.toLowerCase())
      );
    }

    if (this.addressFilter) {
      filtered = filtered.filter(c =>
        c.address.toLowerCase().includes(this.addressFilter.toLowerCase())
      );
    }

    this.totalRecords = filtered.length;

    const start = this.page * this.rows;
    const end = start + this.rows;
    this.displayedContacts = filtered.slice(start, end);
  }

  onPageChange(event: any): void {
    this.page = event.page;
    this.rows = event.rows;
    this.updateDisplayedContacts();
  }

  onFilterChange(): void {
    this.page = 0;
    this.updateDisplayedContacts();
  }

  onEditInit(contact: Contact): void {
    this.clonedContacts[contact.id] = { ...contact };
    this.editingContactId = contact.id;
  }

  onEditSave(contact: Contact): void {
    this.contactService.updateContact(contact.id, contact).subscribe((updated) => {
      if (updated) {
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Contact updated successfully' });
        this.editingContactId = null;
        this.clonedContacts = {};
      }
    });
  }

  onEditCancel(contact: Contact, index: number): void {
    this.displayedContacts[index] = this.clonedContacts[contact.id];
    delete this.clonedContacts[contact.id];
    this.editingContactId = null;
  }

  confirmDelete(contactId: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this contact?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.contactService.deleteContact(contactId).subscribe((success) => {
          if (success) {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Contact deleted successfully' });
            this.loadContacts();
          }
        });
      }
    });
  }
}
