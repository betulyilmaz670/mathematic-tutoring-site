import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  constructor(private fb: FormBuilder,private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  // onSubmit(): void {
  //   if (this.contactForm.valid) {
  //     this.isSubmitting = true;
  //     this.submitSuccess = false;
  //     this.submitError = false;

  //     // Simüle edilmiş form gönderimi (2 saniye bekle)
  //     setTimeout(() => {
  //       console.log('Form Data:', this.contactForm.value);
        
  //       // Başarılı senaryo
  //       this.isSubmitting = false;
  //       this.submitSuccess = true;
  //       this.contactForm.reset();
        
  //       // Başarı mesajını 5 saniye sonra gizle
  //       setTimeout(() => {
  //         this.submitSuccess = false;
  //       }, 5000);

  //       // Gerçek uygulamada burada API çağrısı yapılacak:
  //       // this.contactService.sendMessage(this.contactForm.value).subscribe(...)
  //     }, 2000);
  //   } else {
  //     // Formu işaretle (hataları göster)
  //     Object.keys(this.contactForm.controls).forEach(key => {
  //       this.contactForm.get(key)?.markAsTouched();
  //     });
  //   }
  // } 

  async onSubmit(): Promise<void> {
  if (this.contactForm.valid) {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    const messageData = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone || '',
      subject: this.contactForm.value.subject,
      message: this.contactForm.value.message
    };

    // Supabase'e kaydet
    const { data, error } = await this.supabaseService.sendContactMessage(messageData);
    
    this.isSubmitting = false;

    if (error) {
      console.error('Hata:', error);
      this.submitError = true;
    } else {
      console.log('Başarılı:', data);
      this.submitSuccess = true;
      this.contactForm.reset();
      
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    }
  } else {
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.markAsTouched();
    });
  }
}
}