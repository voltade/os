import { eq, sql } from 'drizzle-orm';

import { serviceSchema } from '../schema.ts';
import { calendarAttendeeTable } from '../tables/calendar_attendee.ts';
import { calendarAppointmentBookingView } from './01-calendar_appointment_booking_view.ts';

export const calendarAppointmentBookingByAttendeeView = serviceSchema
  .view('service_calendar_appointment_booking_by_attendee_view')
  .as((q) =>
    q
      .select({
        // drizzle doesnt do aliasing automatically.. lame
        event_id: sql`${calendarAppointmentBookingView.event_id}`.as(
          'event_id',
        ),
        attendee_id: sql`${calendarAttendeeTable.id}`.as('attendee_id'),
        partner_id: calendarAttendeeTable.partner_id,
      })
      .from(calendarAppointmentBookingView)
      .leftJoin(
        calendarAttendeeTable,
        eq(
          calendarAttendeeTable.event_id,
          calendarAppointmentBookingView.event_id,
        ),
      ),
  );
