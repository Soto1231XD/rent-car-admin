"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Maintenance } from "@/types/maintenance";
import { Rental } from "@/types/rental";

type Props = {
  rentals: Rental[];
  maintenances: Maintenance[];
};

const CAR_EVENT_COLORS = [
  { background: "#1f5f6b", border: "#184e59", text: "#ffffff" },
  { background: "#2f5d8c", border: "#254a70", text: "#ffffff" },
  { background: "#5c5f8f", border: "#474a73", text: "#ffffff" },
  { background: "#4f6f52", border: "#3f5942", text: "#ffffff" },
  { background: "#85586f", border: "#6d465a", text: "#ffffff" },
  { background: "#7c5c36", border: "#63492b", text: "#ffffff" },
  { background: "#566573", border: "#46535f", text: "#ffffff" },
  { background: "#6b6a3f", border: "#555431", text: "#ffffff" },
];

const MAINTENANCE_COLOR = {
  background: "#b91c1c",
  border: "#991b1b",
  text: "#ffffff",
};

export default function AvailabilityCalendar({ rentals, maintenances }: Props) {
  const rentalEvents = rentals.map((rental) => {
    const color = getCarEventColor(rental.carId);

    return {
      id: `rental-${rental.id}`,
      title: `${getCarName(rental)} - ${getClientName(rental)}`,
      start: toDateOnly(rental.startDate),
      end: addOneDay(rental.endDate),
      allDay: true,
      backgroundColor: color.background,
      borderColor: color.border,
      textColor: color.text,
      classNames: ["rentamivar-calendar-event"],
    };
  });

  const maintenanceEvents = maintenances
    .filter((maintenance) => maintenance.status !== "COMPLETADO")
    .map((maintenance) => ({
      id: `maintenance-${maintenance.id}`,
      title: `Mantenimiento: ${getMaintenanceCarName(maintenance)}`,
      start: toDateOnly(maintenance.date),
      allDay: true,
      backgroundColor: MAINTENANCE_COLOR.background,
      borderColor: MAINTENANCE_COLOR.border,
      textColor: MAINTENANCE_COLOR.text,
      classNames: ["rentamivar-calendar-event", "rentamivar-maintenance-event"],
    }));

  const events = [...rentalEvents, ...maintenanceEvents];

  return (
    <div className="rounded-2xl bg-white p-4 shadow sm:p-6">
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900">Guia de colores</p>
          <p className="mt-1">
            Cada vehiculo conserva su propio color. El rojo queda reservado para mantenimiento.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-medium text-slate-700 ring-1 ring-slate-200">
            <span className="h-3 w-3 rounded-full bg-[#b91c1c]" />
            Mantenimiento
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[820px]">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
            locale="es"
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkText={(count) => `+${count} mas`}
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
      </div>

      <style jsx global>{`
        .rentamivar-calendar-event {
          border-radius: 7px;
          font-size: 0.78rem;
          font-weight: 700;
          line-height: 1.25;
          padding: 2px 4px;
        }

        .rentamivar-calendar-event .fc-event-title {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rentamivar-maintenance-event {
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
        }
      `}</style>
    </div>
  );
}

function getClientName(rental: Rental) {
  return rental.client?.fullName ?? "Cliente";
}

function getCarName(rental: Rental) {
  if (!rental.car) {
    return "Vehiculo";
  }

  return `${rental.car.brand} ${rental.car.model}`;
}

function getMaintenanceCarName(maintenance: Maintenance) {
  if (!maintenance.car) {
    return "Vehiculo";
  }

  return `${maintenance.car.brand} ${maintenance.car.model}`;
}

function getCarEventColor(carId: string) {
  const index = getStableIndex(carId, CAR_EVENT_COLORS.length);

  return CAR_EVENT_COLORS[index];
}

function getStableIndex(value: string, length: number) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % length;
  }

  return hash;
}

function addOneDay(date: string) {
  const parsedDate = parseDateOnly(date);

  if (!parsedDate) {
    return date;
  }

  parsedDate.setDate(parsedDate.getDate() + 1);

  return formatDateOnly(parsedDate);
}

function toDateOnly(date: string) {
  return date.split("T")[0];
}

function parseDateOnly(date: string) {
  const [year, month, day] = toDateOnly(date).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
