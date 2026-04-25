"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { rentals } from "@/lib/mock-data";

export default function AvailabilityCalendar() {
  const events = rentals.map((rental) => ({
    id: String(rental.id),
    title: `${rental.carName} - ${rental.clientName}`,
    start: rental.startDate,
    end: rental.endDate,
  }));

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        locale="es"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        buttonText={{
          today: "Hoy",
          month: "Mes",
        }}
      />
    </div>
  );
}