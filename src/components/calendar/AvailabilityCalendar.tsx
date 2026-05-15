"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Rental } from "@/types/rental";

type Props = {
  rentals: Rental[];
};

export default function AvailabilityCalendar({ rentals }: Props) {
  const events = rentals.map((rental) => ({
    id: rental.id,
    title: `${getCarName(rental)} - ${getClientName(rental)}`,
    start: rental.startDate,
    end: rental.endDate,
  }));

  return (
    <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow sm:p-6">
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

function getClientName(rental: Rental) {
  return rental.client?.fullName ?? "Cliente";
}

function getCarName(rental: Rental) {
  if (!rental.car) {
    return "Vehículo";
  }

  return `${rental.car.brand} ${rental.car.model}`;
}
