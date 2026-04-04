// Calendar service - expo-calendar wrapper

import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

async function getDefaultCalendarId(): Promise<string | null> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  if (Platform.OS === 'ios') {
    const defaultCalendar = calendars.find(
      (c) => c.source?.name === 'Default' || c.allowsModifications
    );
    return defaultCalendar?.id || calendars[0]?.id || null;
  } else {
    const primaryCalendar = calendars.find(
      (c) => c.isPrimary || c.allowsModifications
    );
    if (primaryCalendar) return primaryCalendar.id;

    // Create a new calendar for the app
    const newCalendarId = await Calendar.createCalendarAsync({
      title: '戒色助手',
      color: '#6C5CE7',
      entityType: Calendar.EntityTypes.EVENT,
      source: calendars[0]?.source || { isLocalAccount: true, name: '戒色助手', type: '' as any },
      name: 'addictionquitr',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    return newCalendarId;
  }
}

export async function createCalendarEvent(params: {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes?: number;
  reminderMinutes?: number;
}): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const calendarId = await getDefaultCalendarId();
    if (!calendarId) {
      return { success: false, error: '无法获取日历权限' };
    }

    const [year, month, day] = params.date.split('-').map(Number);
    const [hour, minute] = params.time.split(':').map(Number);
    const startDate = new Date(year, month - 1, day, hour, minute);
    const duration = params.durationMinutes || 30;
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: params.title,
      startDate,
      endDate,
      alarms: params.reminderMinutes
        ? [{ relativeOffset: -(params.reminderMinutes || 10) }]
        : [{ relativeOffset: -10 }],
      notes: '由戒色助手创建',
    });

    return { success: true, eventId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTodayEvents(): Promise<any[]> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return [];

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const calendarIds = calendars.map((c) => c.id);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const events = await Calendar.getEventsAsync(calendarIds, startOfDay, endOfDay);
    return events;
  } catch {
    return [];
  }
}
