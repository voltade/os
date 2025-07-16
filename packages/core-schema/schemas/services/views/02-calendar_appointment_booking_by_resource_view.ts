import { eq, sql } from 'drizzle-orm';
import { pgView } from 'drizzle-orm/pg-core';

import { calendarEventResourceRelTable } from '../tables/calendar_event_resource_rel.ts';
import { calendarAppointmentBookingView } from './01-calendar_appointment_booking_view.ts';

export const calendarAppointmentBookingByResourceView = pgView(
  'service_calendar_appointment_booking_by_resource_view',
).as((q) =>
  q
    .select({
      event_id: sql`${calendarAppointmentBookingView.event_id}`.as('event_id'),
      resource_id: calendarEventResourceRelTable.resource_id,
    })
    .from(calendarAppointmentBookingView)
    .leftJoin(
      calendarEventResourceRelTable,
      eq(
        calendarEventResourceRelTable.event_id,
        calendarAppointmentBookingView.event_id,
      ),
    ),
);
