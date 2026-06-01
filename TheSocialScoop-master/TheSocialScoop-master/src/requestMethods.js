import axios from "axios";
const BASE_URL = "http://localhost:5000/api/";
const TOKEN = "local-dev-token";
export const publicRequest = axios.create({
  baseURL: BASE_URL,
});
export const userRequest = axios.create({
  baseURL: BASE_URL,
  headers: { token: `Barer ${TOKEN}` },
});
