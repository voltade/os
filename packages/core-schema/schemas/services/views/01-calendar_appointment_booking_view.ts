import { isNotNull } from 'drizzle-orm';

import { serviceSchema } from '../schema.ts';
import { calendarEventTable } from '../tables/calendar_event.ts';

export const calendarAppointmentBookingView = serviceSchema
  .view('service_calendar_appointment_booking_view')
  .as((q) =>
    q
      .select({
        event_id: calendarEventTable.id,
        appointment_id: calendarEventTable.appointment_id,
      })
      .from(calendarEventTable)
      .where(isNotNull(calendarEventTable.appointment_id)),
  );
