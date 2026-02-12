import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    console.log('🔵 Supabase Service başlatılıyor...');
    console.log('URL:', environment.supabaseUrl);
    console.log('Key var mı?:', environment.supabaseKey ? 'EVET ✅' : 'HAYIR ❌');
    console.log('Key uzunluğu:', environment.supabaseKey?.length);

    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    console.log('✅ Supabase başarıyla oluşturuldu!');
  }

  // Randevu oluşturma
  async createAppointment(appointment: any) {
    console.log('📝 createAppointment çağrıldı');
    console.log('Appointment data:', appointment);

    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .insert([appointment])
        .select();

      if (error) {
        console.error('❌ Supabase hatası:', error);
        throw error;
      }

      console.log('✅ Randevu başarıyla kaydedildi:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Catch bloğu hatası:', error);
      return { data: null, error };
    }
  }

  // Tüm randevuları getirme
  async getAppointments() {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Randevuları getirme hatası:', error);
      return { data: null, error };
    }
  }

  // Belirli tarihteki randevuları getirme
  async getAppointmentsByDate(date: string) {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', date);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Tarih bazlı randevu getirme hatası:', error);
      return { data: null, error };
    }
  }

  // İletişim mesajı gönderme
  async sendContactMessage(message: any) {
    try {
      const { data, error } = await this.supabase
        .from('contact_messages')
        .insert([message])
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      return { data: null, error };
    }
  }

  // Tüm iletişim mesajlarını getirme
  async getContactMessages() {
    try {
      const { data, error } = await this.supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Mesajları getirme hatası:', error);
      return { data: null, error };
    }
  }
}