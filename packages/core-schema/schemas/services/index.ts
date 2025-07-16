/**
 * This file is to support the typed [include relations](https://orm.drizzle.team/docs/rqb#include-relations) from drizzle query (the drizzle easy mode)
 */

export * from './tables/appointment_resource.ts';
export * from './tables/appointment_type.ts';
export * from './tables/appointment_type_appointment_resource_rel.ts';
export * from './tables/appointment_type_res_user_rel.ts';
export * from './tables/appointment_type_schedule.ts';
export * from './tables/calendar_attendee.ts';
export * from './tables/calendar_event.ts';
export * from './tables/calendar_event_resource_rel.ts';
export * from './tables/calendar_recurrence.ts';
export * from './views/01-calendar_appointment_booking_view.ts';
export * from './views/02-calendar_appointment_booking_by_attendee_view.ts';
export * from './views/02-calendar_appointment_booking_by_resource_view.ts';
