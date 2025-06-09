import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, } from 'rxjs/operators';

export interface Contact {
  _id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaginatedResponse {
  contacts: Contact[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalContacts: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly apiUrl = 'http://localhost:3001/api/contacts';

  private contactsSubject = new BehaviorSubject<Contact[]>([]);
  private paginationSubject = new BehaviorSubject<any>(null);

  public contacts$ = this.contactsSubject.asObservable();
  public pagination$ = this.paginationSubject.asObservable();

  constructor(private http: HttpClient) {}

loadContacts(page = 1, limit = 5, filters: { name?: string; phone?: string; address?: string } = {}): void {
  let params = new HttpParams()
    .set('page', page)
    .set('limit', limit);

  if (filters.name) {
    params = params.set('name', filters.name);
  }
  if (filters.phone) {
    params = params.set('phone', filters.phone);
  }
  if (filters.address) {
    params = params.set('address', filters.address);
  }

  this.http.get<PaginatedResponse>(this.apiUrl, { params })
    .pipe(catchError(this.handleError))
    .subscribe({
      next: res => {
        this.contactsSubject.next(res.contacts);
        this.paginationSubject.next(res.pagination);
      },
      error: () => {
        this.contactsSubject.next([]);
        this.paginationSubject.next(null);
      }
    });
}

  getContactById(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  addContact(contact: Omit<Contact, '_id' | 'createdAt' | 'updatedAt'>): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, contact).pipe(
      tap(newContact => this.contactsSubject.next([...this.contactsSubject.value, newContact])),
      catchError(this.handleError)
    );
  }

  updateContact(id: string, contact: Partial<Contact>): Observable<Contact> {
    return this.http.post<Contact>(`${this.apiUrl}/${id}`, contact).pipe(
      tap(updated => {
        const contacts = this.contactsSubject.value.map(c => c._id === id ? updated : c);
        this.contactsSubject.next(contacts);
      }),
      catchError(this.handleError)
    );
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.contactsSubject.next(this.contactsSubject.value.filter(c => c._id !== id))),
      catchError(this.handleError)
    );
  }


  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('ContactService error:', error);
    return throwError(() => ({
      message: error.error?.error || 'Server Error',
      status: error.status
    }));
  };
}
