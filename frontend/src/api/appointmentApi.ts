// src/api/appointmentApi.ts
import axios from "axios";
import API_BASE_URL from "./config";

export const getAppointments = () => axios.get(`${API_BASE_URL}/appointments`);
export const getAppointment = (id: number) =>
  axios.get(`${API_BASE_URL}/appointments/${id}`);
export const createAppointment = (appointmentData: any) =>
  axios.post(`${API_BASE_URL}/appointments`, appointmentData);
export const updateAppointment = (id: number, appointmentData: any) =>
  axios.patch(`${API_BASE_URL}/appointments/${id}`, appointmentData);
export const cancelAppointment = (id: number) =>
  axios.patch(`${API_BASE_URL}/appointments/${id}/cancel`);
export const deleteAppointment = (id: number) =>
  axios.delete(`${API_BASE_URL}/appointments/${id}`);

export const getAvailableSlots = (doctor: string, date: string) =>
  axios.get(`${API_BASE_URL}/slots`, { params: { doctor, date } });
