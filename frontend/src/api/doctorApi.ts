import axios from "axios";
import API_BASE_URL from "./config";

export const searchDoctors = (location: string, specialty?: string) => {
  const params = new URLSearchParams({ location });
  if (specialty) params.append("specialty", specialty);
  return axios.get(`${API_BASE_URL}/doctors/search?${params.toString()}`);
};

export const getDoctorDetails = (placeId: string) =>
  axios.get(`${API_BASE_URL}/doctors/${placeId}/details`);
