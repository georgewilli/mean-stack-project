import { Component, OnInit, OnDestroy, viewChild, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Contact, ContactService } from '../contact.service';
import { Table, TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ContactLockPayload, ContactUnlockPayload, InitialLockState, LockFailedPayload, SocketService } from '../../../services/socket.service';
import { AuthService } from '../../auth/auth.service';
import { TooltipModule } from 'primeng/tooltip';
import { IconField, IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
    TooltipModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [ContactService, ConfirmationService, MessageService],
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.scss'],
})
export class ContactsListComponent implements OnInit, OnDestroy {
  @ViewChild('dt1') dt: Table | undefined;
    
  

  contacts: Contact[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 5;

  // Editing
  editingContactId: string | null = null;
  clonedContacts: { [key: string]: Contact } = {};

  // locking
  lockedContacts: { [key: string]: string } = {};
  userId : string | null
  userName :string | null

  // Filters
  nameFilter: string = '';
  phoneFilter: string = '';
  addressFilter: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private contactService: ContactService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private socketService: SocketService,
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();
   this.userId = user?._id ?? null;
   this.userName = user?.username ?? null
  }

  ngOnInit(): void {
    this.setupSubscriptions();
    this.socketService.listen<ContactLockPayload>('contact-locked').subscribe(data => {
      this.lockedContacts[data.contactId] = data.userName;
    });
  
    this.socketService.listen<ContactUnlockPayload>('contact-unlocked').subscribe(data => {
      delete this.lockedContacts[data.contactId];
    });
  
    this.socketService.listen<InitialLockState[]>('locked-contacts').subscribe((locks) => {
      this.lockedContacts = {};
      locks.forEach(lock => {
        this.lockedContacts[lock.contactId] = lock.lockedBy;
      });
    });
  
    this.socketService.listen<LockFailedPayload>('lock-failed').subscribe(data => {
      this.messageService.add({
        severity: 'warn',
        summary: 'Locked',
        detail: data.message,
      });
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    this.contactService.contacts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((contacts) => {
        this.contacts = contacts;
        this.loading = false;
      });

    this.contactService.pagination$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pagination) => {
        if (pagination) {
          this.totalRecords = pagination.totalContacts;
          this.currentPage = pagination.currentPage;
          this.pageSize = pagination.limit;
        }
      });
  }

  loadContacts(page: number, pageSize: number) {
    this.loading = true;
    this.contactService.loadContacts(page , pageSize)

  }
  onTableLazyLoad(event: any): void {
    const page = Math.floor(event.first / event.rows) + 1;
    const rows = event.rows;

    // Always fetch even if page hasn't changed — because filters might have changed
    this.loadContacts(page, rows);
  
  }



  onEditInit(contact: Contact): void {
    this.socketService.emit('lock-contact', { contactId: contact._id, userId: this.userId, userName: this.userName });
    this.clonedContacts[contact._id] = { ...contact };
    this.editingContactId = contact._id;
  }

  onEditSave(contact: Contact): void {
    this.contactService.updateContact(contact._id, contact).subscribe((updated) => {
      if (updated) {
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Contact updated successfully' });
        this.socketService.emit('unlock-contact', { contactId: contact._id, userId: this.userId });
        this.editingContactId = null;
        delete this.clonedContacts[contact._id];
      }
    });
  }

  onEditCancel(contact: Contact): void {
    const original = this.clonedContacts[contact._id];
    const index = this.contacts.findIndex(c => c._id === contact._id);
    if (index !== -1 && original) {
      this.contacts[index] = original;
    }
    this.socketService.emit('unlock-contact', { contactId: contact._id, userId: this.userId });

    delete this.clonedContacts[contact._id];
    this.editingContactId = null;
  }

  confirmDelete(contactId: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this contact?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.contactService.deleteContact(contactId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Contact deleted successfully' });
            this.loadContacts(this.currentPage, this.pageSize);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete contact' });
          }
        });
      }
    });
  }

  navigateToContactForm(): void {
    this.router.navigate(['/contacts/add']);
  }
}
