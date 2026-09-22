import { reminderModel } from '../models/reminderModel.js';
import { subscriptionModel } from '../models/subscriptionModel.js';
import { userModel } from '../models/userModel.js';
import { parseDateParts, formatDateString } from './subscriptionService.js';

export const reminderService = {
  /**
   * Scans active subscriptions for upcoming renewals within reminderDays
   * and creates pending reminder records if not already created for this cycle.
   */
  async syncRemindersForUser(userId) {
    const user = await userModel.findById(userId);
    if (!user) return [];

    const subscriptions = await subscriptionModel.findAllForUser(userId);
    const active = subscriptions.filter((s) => s.status === 'active');
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const createdReminders = [];

    for (const sub of active) {
      const reminderDays = sub.reminderDaysBefore || 3;
      const subDueDate = parseDateParts(sub.nextRenewalDate);
      const diffDays = Math.round((subDueDate.getTime() - todayStart.getTime()) / (24 * 60 * 60 * 1000));

      // If renewal is within reminderDays (e.g. 0 to 3 days, or overdue)
      if (diffDays <= reminderDays && diffDays >= -7) {
        const dueDateStr = formatDateString(subDueDate);
        const existing = await reminderModel.findRecentForSubscription(userId, sub.id, dueDateStr);

        if (!existing) {
          const daysText =
            diffDays === 0
              ? 'due today'
              : diffDays > 0
              ? `due in ${diffDays} day${diffDays === 1 ? '' : 's'}`
              : `overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;

          const message = `${sub.name} is ${daysText} (${sub.currency} ${Number(sub.amount).toFixed(2)}). Confirm payment once charged to advance to the next cycle.`;

          const reminder = await reminderModel.create({
            userId,
            subscriptionId: sub.id,
            dueDate: dueDateStr,
            status: 'pending',
            sentAt: new Date(),
            channel: 'in_app',
            message,
          });

          await subscriptionModel.updateReminderSentAt(userId, sub.id, new Date());
          createdReminders.push(reminder);

          // Log reminder dispatch (could be extended to nodemailer / webhooks)
          console.log(`[Reminder Dispatched] User: ${user.email} | Sub: ${sub.name} | Due: ${dueDateStr} (${daysText})`);
        }
      }
    }

    return reminderModel.findPendingForUser(userId);
  },

  async getPendingReminders(userId) {
    return this.syncRemindersForUser(userId);
  },

  async dismissReminder(userId, reminderId) {
    return reminderModel.dismiss(userId, reminderId);
  },

  async triggerManualReminder(userId, subscriptionId) {
    const sub = await subscriptionModel.findById(userId, subscriptionId);
    if (!sub) throw new Error('Subscription not found');

    const dueDateStr = formatDateString(parseDateParts(sub.nextRenewalDate));
    const message = `Manual Reminder: ${sub.name} is scheduled for renewal on ${dueDateStr} (${sub.currency} ${Number(sub.amount).toFixed(2)}).`;

    const reminder = await reminderModel.create({
      userId,
      subscriptionId: sub.id,
      dueDate: dueDateStr,
      status: 'pending',
      sentAt: new Date(),
      channel: 'in_app',
      message,
    });

    await subscriptionModel.updateReminderSentAt(userId, sub.id, new Date());
    return reminder;
  },
};
