import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/notifications.service';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements OnInit {
  reminderEnabled = false;
  reminderTime = '19:00';
  newReleaseEnabled = false;
  summaryEnabled = false;
  theme: 'auto' | 'light' | 'dark' = 'auto';
  autoplay = false;
  summaryTime = '18:00';

  constructor(private notificationService: NotificationService) {}

  async ngOnInit() {
    this.reminderEnabled = await this.notificationService.isReminderEnabled();
    const time = await this.notificationService.getReminderTime();

    if (time) this.reminderTime = time;
    this.newReleaseEnabled = await this.notificationService.isNewReleaseEnabled();
    this.summaryEnabled = await this.notificationService.isSummaryEnabled();

    const { value: theme } = await Preferences.get({ key: 'theme' });
    if (theme) this.theme = theme as 'auto' | 'light' | 'dark';

    const { value: autoplay } = await Preferences.get({ key: 'autoplay' });
    if (autoplay) this.autoplay = autoplay === 'true';

    this.summaryEnabled = await this.notificationService.isSummaryEnabled();
    const { value: summaryTime } = await Preferences.get({ key: 'summary_time' });
    if (summaryTime) this.summaryTime = summaryTime;
  }

  async toggleNewReleaseNotif() {
    if (this.newReleaseEnabled) {
      await this.notificationService.scheduleNewReleaseNotification();
    } else {
      await this.notificationService.cancelNewReleaseNotification();
    }
  }

  async toggleReminder() {
    if (this.reminderEnabled) {
      const [hour, minute] = this.reminderTime.split(':').map(Number);
      await this.notificationService.scheduleDailyReminder(hour, minute);
    } else {
      await this.notificationService.cancelDailyReminder();
    }
  }

  async updateReminderTime() {
    if (this.reminderEnabled) {
      const [hour, minute] = this.reminderTime.split(':').map(Number);
      await this.notificationService.scheduleDailyReminder(hour, minute);
    }
  }

  async toggleSummaryNotif() {
    if (this.summaryEnabled) {
      const [hour, minute] = this.summaryTime.split(':').map(Number);
      await this.notificationService.scheduleDailySummary(hour, minute);
      await Preferences.set({ key: 'summary_time', value: this.summaryTime });
    } else {
      await this.notificationService.cancelDailySummary();
    }
  }

  async updateSummaryTime() {
    if (this.summaryEnabled) {
      const [hour, minute] = this.summaryTime.split(':').map(Number);
      await this.notificationService.scheduleDailySummary(hour, minute);
      await Preferences.set({ key: 'summary_time', value: this.summaryTime });
    }
  }

  async onThemeChange(event: any) {
    await Preferences.set({ key: 'theme', value: this.theme });
    // Optionally apply theme immediately
    document.body.setAttribute('color-theme', this.theme);
  }

  async onAutoplayChange() {
    await Preferences.set({ key: 'autoplay', value: this.autoplay.toString() });
  }
}