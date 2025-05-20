import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { SpotifyService } from './spotify.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private spotifyService: SpotifyService) {}

  // Daily Reminder
  async scheduleDailyReminder(hour: number, minute: number) {
    await LocalNotifications.requestPermissions();
    await LocalNotifications.schedule({
      notifications: [{
        id: 1,
        title: 'Time to listen to music!',
        body: 'Enjoy your favorite tracks now.',
        schedule: { on: { hour, minute }, repeats: true },
      }]
    });
    await Preferences.set({ key: 'music_reminder_enabled', value: 'true' });
    await Preferences.set({ key: 'music_reminder_time', value: `${hour}:${minute}` });
  }

  async cancelDailyReminder() {
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    await Preferences.set({ key: 'music_reminder_enabled', value: 'false' });
  }

  async isReminderEnabled(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'music_reminder_enabled' });
    return value === 'true';
  }

  async getReminderTime(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'music_reminder_time' });
    return value || null;
  }

  // New Release Notification
  async scheduleNewReleaseNotification() {
    await LocalNotifications.requestPermissions();
    // For demo: check every day at 10am (id: 2)
    await LocalNotifications.schedule({
      notifications: [{
        id: 2,
        title: 'New Release Alert!',
        body: 'Check if your favorite artists have new music!',
        schedule: { on: { hour: 10, minute: 0 }, repeats: true },
      }]
    });
    await Preferences.set({ key: 'new_release_enabled', value: 'true' });
  }

  async cancelNewReleaseNotification() {
    await LocalNotifications.cancel({ notifications: [{ id: 2 }] });
    await Preferences.set({ key: 'new_release_enabled', value: 'false' });
  }

  async isNewReleaseEnabled(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'new_release_enabled' });
    return value === 'true';
  }

  // Daily Listening Summary at 6pm
  async scheduleDailySummary(hour: number, minute: number) {
    await LocalNotifications.requestPermissions();
    const summary = await this.getListeningSummary();
    await LocalNotifications.schedule({
      notifications: [{
        id: 3,
        title: 'Your Listening Summary',
        body: summary,
        schedule: { on: { hour, minute }, repeats: true },
      }]
    });
    await Preferences.set({ key: 'summary_enabled', value: 'true' });
    await Preferences.set({ key: 'summary_time', value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}` });
  }

  async cancelDailySummary() {
    await LocalNotifications.cancel({ notifications: [{ id: 3 }] });
    await Preferences.set({ key: 'summary_enabled', value: 'false' });
  }

  async isSummaryEnabled(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'summary_enabled' });
    return value === 'true';
  }

  // Example: Get listening summary (tracks played today)
  async getListeningSummary(): Promise<string> {
    // For demo: get a counter from preferences
    const { value } = await Preferences.get({ key: 'tracks_played_today' });
    const count = value ? parseInt(value, 10) : 0;
    // Optionally, fetch top track/artist from SpotifyService
    let topTrack = '';
    try {
      const tracks = await this.spotifyService.getUserTopTracks();
      if (tracks && tracks.length > 0) {
        topTrack = `Top track: ${tracks[0].name} by ${tracks[0].artists[0].name}`;
      }
    } catch {}
    return `You've listened to ${count} tracks today. ${topTrack}`;
  }

  async incrementTracksPlayedToday() {
    const today = new Date().toISOString().slice(0, 10);
    const { value } = await Preferences.get({ key: 'tracks_played_date' });
    if (value !== today) {
      await Preferences.set({ key: 'tracks_played_today', value: '1' });
      await Preferences.set({ key: 'tracks_played_date', value: today });
    } else {
      const { value: count } = await Preferences.get({ key: 'tracks_played_today' });
      const newCount = count ? parseInt(count, 10) + 1 : 1;
      await Preferences.set({ key: 'tracks_played_today', value: newCount.toString() });
    }
  }
}