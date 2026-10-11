import React from 'react';

export const getAppointmentServices = (appointment) => {
  if (Array.isArray(appointment.services) && appointment.services.length) return appointment.services;
  if (appointment.service) return [appointment.service];
  return appointment.service_name ? [{ name: appointment.service_name }] : [];
};

export const getAppointmentTotal = (appointment, field, snapshot, serviceField) => {
  if (appointment[field] !== null && appointment[field] !== undefined) return Number(appointment[field]);
  const services = getAppointmentServices(appointment);
  const values = services.map((service) => service.pivot?.[snapshot] ?? service[serviceField]);
  if (!values.length || values.some((value) => value === null || value === undefined)) return null;
  return values.reduce((sum, value) => sum + Number(value), 0);
};

const AppointmentServices = ({ appointment }) => {
  const services = getAppointmentServices(appointment);
  if (!services.length) return <span>—</span>;
  return (
    <ul className="appointment-services" aria-label="Booked services">
      {services.map((service, index) => (
        <li key={service.id ?? index}>
          <span>{service.name}</span>
          {(service.is_addon === true || Number(service.is_addon) === 1) && (
            <span className="appointment-addon">Add-on</span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default AppointmentServices;
