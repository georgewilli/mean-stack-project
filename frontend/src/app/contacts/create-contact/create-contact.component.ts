import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatFormFieldModule, MatLabel ,} from '@angular/material/form-field';
import {MatInputModule}  from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactService } from '../contact.service';
import { Subject, takeUntil } from 'rxjs';
import{MatProgressSpinnerModule} from '@angular/material/progress-spinner';
@Component({
  selector: 'app-create-contact',
  standalone: true,
  imports: [ReactiveFormsModule,MatFormFieldModule,MatProgressSpinnerModule ,CommonModule ,MatIconModule,MatLabel,MatInputModule, MatButtonModule],
  templateUrl: './create-contact.component.html',
  styleUrl: './create-contact.component.scss'
})
export class CreateContactComponent {
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;
  contactId: number | null = null;
  pageTitle: string = 'Add New Contact';
  
  private destroy$ = new Subject<void>();
  contactForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[\d\s\-\(\)]+$/)]],
      address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      notes: ['', [Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.contactId = +params['id'];
        this.pageTitle = 'Edit Contact';
        this.loadContact(this.contactId);
      }
    });

    // Update page title based on route data
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data['title']) {
        this.pageTitle = data['title'];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadContact(id: number): void {
    this.isLoading = true;
    
    this.contactService.getContactById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contact) => {
          if (contact) {
            this.contactForm.patchValue({
              name: contact.name,
              phone: contact.phone,
              address: contact.address,
              notes: contact.notes || ''
            });
          } else {
            this.showError('Contact not found');
            this.router.navigate(['/contacts']);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading contact:', error);
          this.showError('Failed to load contact');
          this.isLoading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSaving) {
      this.isSaving = true;
      const formData = this.contactForm.value;

      if (this.isEditMode && this.contactId) {
        this.updateContact(formData);
      } else {
        this.createContact(formData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createContact(formData: any): void {
    this.contactService.addContact(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contact) => {
          this.showSuccess(`Contact "${contact.name}" created successfully!`);
          this.router.navigate(['/contacts']);
        },
        error: (error) => {
          console.error('Error creating contact:', error);
          this.showError('Failed to create contact');
          this.isSaving = false;
        }
      });
  }

  private updateContact(formData: any): void {
    if (!this.contactId) return;

    this.contactService.updateContact(this.contactId, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contact) => {
          if (contact) {
            this.showSuccess(`Contact "${contact.name}" updated successfully!`);
            this.router.navigate(['/contacts']);
          } else {
            this.showError('Contact not found');
          }
        },
        error: (error) => {
          console.error('Error updating contact:', error);
          this.showError('Failed to update contact');
          this.isSaving = false;
        }
      });
  }

  onCancel(): void {
    if (this.contactForm.dirty && !this.isSaving) {
      const confirmCancel = confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (confirmCancel) {
        this.navigateBack();
      }
    } else {
      this.navigateBack();
    }
  }

  private navigateBack(): void {
    this.router.navigate(['/contacts']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  // Helper methods for template
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.contactForm.get(fieldName);
    return field ? field.hasError(errorType) && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    const fieldDisplayName = this.getFieldDisplayName(fieldName);

    if (errors['required']) {
      return `${fieldDisplayName} is required`;
    }
    if (errors['minlength']) {
      return `${fieldDisplayName} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `${fieldDisplayName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['pattern']) {
      return 'Please enter a valid phone number';
    }
    
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'name': 'Name',
      'phone': 'Phone number',
      'address': 'Address',
      'notes': 'Notes'
    };
    return displayNames[fieldName] || fieldName;
  }

  // Getters for template
  get isFormValid(): boolean {
    return this.contactForm.valid;
  }

  get submitButtonText(): string {
    if (this.isSaving) {
      return this.isEditMode ? 'Updating...' : 'Saving...';
    }
    return this.isEditMode ? 'Update Contact' : 'Save Contact';
  }
}