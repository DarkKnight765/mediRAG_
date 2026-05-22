// src/api/appointmentApi.ts
import axios from "axios";
import API_BASE_URL from "./config";

export const getAppointments = () => axios.get(`${API_BASE_URL}/appointments`);
export const createAppointment = (appointmentData: any) =>
  axios.post(`${API_BASE_URL}/appointments`, appointmentData);
export const updateAppointment = (id: string, appointmentData: any) =>
  axios.put(`${API_BASE_URL}/appointments/${id}`, appointmentData);
export const deleteAppointment = (id: string) =>
  axios.delete(`${API_BASE_URL}/appointments/${id}`);
