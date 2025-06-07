import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Contact {
  id: number;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contacts: Contact[] = [];
  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  private nextId = 1;

  constructor() {
    this.loadMockData();
  }

  // Get all contacts as Observable
  getContacts(): Observable<Contact[]> {
    return this.contactsSubject.asObservable();
  }

  // Get contact by ID
  getContactById(id: number): Observable<Contact | undefined> {
    const contact = this.contacts.find(c => c.id === id);
    return of(contact).pipe(delay(100)); // Simulate API delay
  }

  // Add new contact
  addContact(contactData: Omit<Contact, 'id' | 'createdAt'>): Observable<Contact> {
    const newContact: Contact = {
      ...contactData,
      id: this.nextId++,
      createdAt: new Date()
    };
    
    this.contacts.push(newContact);
    this.contactsSubject.next([...this.contacts]);
    
    return of(newContact).pipe(delay(500)); // Simulate API delay
  }

  // Update existing contact
  updateContact(id: number, contactData: Partial<Contact>): Observable<Contact | null> {
    const index = this.contacts.findIndex(c => c.id === id);
    
    if (index === -1) {
      return of(null);
    }

    const updatedContact: Contact = {
      ...this.contacts[index],
      ...contactData,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    this.contacts[index] = updatedContact;
    this.contactsSubject.next([...this.contacts]);
    
    return of(updatedContact).pipe(delay(500)); // Simulate API delay
  }

  // Delete contact
  deleteContact(id: number): Observable<boolean> {
    const index = this.contacts.findIndex(c => c.id === id);
    
    if (index === -1) {
      return of(false);
    }

    this.contacts.splice(index, 1);
    this.contactsSubject.next([...this.contacts]);
    
    return of(true).pipe(delay(300)); // Simulate API delay
  }

  // Search contacts
  searchContacts(searchTerm: string): Observable<Contact[]> {
    if (!searchTerm.trim()) {
      return this.getContacts();
    }

    const term = searchTerm.toLowerCase().trim();
    return this.getContacts().pipe(
      map(contacts => contacts.filter(contact =>
        contact.name.toLowerCase().includes(term) ||
        contact.phone.toLowerCase().includes(term) ||
        contact.address.toLowerCase().includes(term) ||
        (contact.notes && contact.notes.toLowerCase().includes(term))
      ))
    );
  }

  // Get contact count
  getContactCount(): Observable<number> {
    return this.getContacts().pipe(
      map(contacts => contacts.length)
    );
  }

  // Check if contact exists
  contactExists(name: string, phone: string, excludeId?: number): Observable<boolean> {
    return this.getContacts().pipe(
      map(contacts => contacts.some(contact => 
        contact.id !== excludeId &&
        (contact.name.toLowerCase() === name.toLowerCase() || 
         contact.phone === phone)
      ))
    );
  }

  private loadMockData(): void {
    this.contacts = [
      {
        id: this.nextId++,
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        address: '123 Main Street, New York, NY 10001',
        notes: 'Regular customer, prefers email contact',
        createdAt: new Date('2024-01-15')
      },
      {
        id: this.nextId++,
        name: 'Jane Smith',
        phone: '+1 (555) 987-6543',
        address: '456 Oak Avenue, Los Angeles, CA 90210',
        notes: 'VIP client, handle with priority',
        createdAt: new Date('2024-02-20')
      },
      {
        id: this.nextId++,
        name: 'Mike Johnson',
        phone: '+1 (555) 456-7890',
        address: '789 Pine Road, Chicago, IL 60601',
        notes: '',
        createdAt: new Date('2024-03-10')
      },
      {
        id: this.nextId++,
        name: 'Sarah Wilson',
        phone: '+1 (555) 321-0987',
        address: '321 Elm Street, Houston, TX 77001',
        notes: 'Prefers afternoon calls only',
        createdAt: new Date('2024-03-25')
      },
      {
        id: this.nextId++,
        name: 'David Brown',
        phone: '+1 (555) 654-3210',
        address: '654 Maple Drive, Phoenix, AZ 85001',
        notes: 'New client, follow up next week',
        createdAt: new Date('2024-04-05')
      },
      {
        id: this.nextId++,
        name: 'Emily Davis',
        phone: '+1 (555) 789-0123',
        address: '987 Cedar Lane, Philadelphia, PA 19101',
        notes: 'Interested in premium services',
        createdAt: new Date('2024-04-12')
      }
    ];
    
    this.contactsSubject.next([...this.contacts]);
  }
}