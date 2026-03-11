import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import emailjs from '@emailjs/browser';

interface TimeSlot {
  time: string;
  disabled: boolean;
}

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit {
  appointmentForm!: FormGroup;
  selectedDate: Date | null = null;
  selectedTime: TimeSlot | null = null;
  minDate: Date = new Date();
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  availableTimeSlots: TimeSlot[] = [
    { time: '09:00', disabled: false },
    { time: '10:00', disabled: false },
    { time: '11:00', disabled: false },
    { time: '13:00', disabled: false },
    { time: '14:00', disabled: false },
    { time: '15:00', disabled: false },
    { time: '16:00', disabled: false },
    { time: '17:00', disabled: false },
    { time: '18:00', disabled: false }
  ];

  constructor(private fb: FormBuilder, private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.appointmentForm = this.fb.group({
      studentName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      gradeLevel: ['', Validators.required],
      subject: ['', Validators.required],
      format: ['', Validators.required],
      notes: ['']
    });
  }

  // Takvimde sadece gelecek tarihleri ve hafta içi günleri aktif et
  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    
    const day = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sadece pazartesi-cumartesi (1-6) ve gelecek tarihler
    return day !== 0 && date >= today;
  };

  onDateSelected(date: Date | null): void {
    this.selectedDate = date;
    this.selectedTime = null;
    
    // Gerçek uygulamada bu saatler API'den gelecek
    // Örnek: bazı saatleri dolu göster
    this.availableTimeSlots = this.availableTimeSlots.map(slot => ({
      ...slot,
      disabled: Math.random() > 0.7 // Random olarak bazılarını dolu yap
    }));
  }

  selectTime(slot: TimeSlot): void {
    if (!slot.disabled) {
      this.selectedTime = slot;
    }
  }

  // onSubmit(): void {
  //   if (this.appointmentForm.valid && this.selectedDate && this.selectedTime) {
  //     this.isSubmitting = true;
  //     this.submitSuccess = false;
  //     this.submitError = false;

  //     const appointmentData = {
  //       ...this.appointmentForm.value,
  //       date: this.selectedDate,
  //       time: this.selectedTime.time
  //     };

  //     // Simüle edilmiş API çağrısı
  //     setTimeout(() => {
  //       console.log('Randevu Verisi:', appointmentData);
        
  //       this.isSubmitting = false;
  //       this.submitSuccess = true;
        
  //       // Formu sıfırla
  //       this.appointmentForm.reset();
  //       this.selectedDate = null;
  //       this.selectedTime = null;
        
  //       // Başarı mesajını 8 saniye sonra gizle
  //       setTimeout(() => {
  //         this.submitSuccess = false;
  //       }, 8000);

  //       // Gerçek uygulamada:
  //       // this.appointmentService.createAppointment(appointmentData).subscribe(...)
  //     }, 2000);
  //   } else {
  //     // Formu işaretle
  //     Object.keys(this.appointmentForm.controls).forEach(key => {
  //       this.appointmentForm.get(key)?.markAsTouched();
  //     });
  //   }
  // }

  async onSubmit(): Promise<void> {
  if (this.appointmentForm.valid && this.selectedDate && this.selectedTime) {
    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    const appointmentData = {
      student_name: this.appointmentForm.value.studentName,
      email: this.appointmentForm.value.email,
      phone: this.appointmentForm.value.phone,
      grade_level: this.appointmentForm.value.gradeLevel,
      subject: this.appointmentForm.value.subject,
      format: this.appointmentForm.value.format,
      appointment_date: this.selectedDate.toISOString().split('T')[0],
      appointment_time: this.selectedTime.time,
      notes: this.appointmentForm.value.notes || '',
      status: 'pending'
    };

    // Supabase'e kaydet
    const { data, error } = await this.supabaseService.createAppointment(appointmentData);
    
    this.isSubmitting = false;

    if (error) {
      console.error('Hata:', error);
      this.submitError = true;
    } else {
      console.log('Başarılı:', data);
      this.submitSuccess = true;
      // EmailJS ile mail gönder
  await emailjs.send(
    'servis_1j4rqv5',
    'template_fm0ksaj',
    {
      from_name: this.appointmentForm.value.studentName,
      from_email: this.appointmentForm.value.email,
      phone: this.appointmentForm.value.phone,
      date: this.selectedDate!.toLocaleDateString('tr-TR'),
      time: this.selectedTime!.time,
      subject: this.appointmentForm.value.subject,
      message: this.appointmentForm.value.notes || 'Not girilmedi'
    },
    'TZgjfKYHC9aW01cK7'
  );

  this.submitSuccess = true;
      // Formu sıfırla
      this.appointmentForm.reset();
      this.selectedDate = null;
      this.selectedTime = null;
      
      // Başarı mesajını 8 saniye sonra gizle
      setTimeout(() => {
        this.submitSuccess = false;
      }, 8000);
    }
  } else {
    // Formu işaretle
    Object.keys(this.appointmentForm.controls).forEach(key => {
      this.appointmentForm.get(key)?.markAsTouched();
    });
  }
}
}


