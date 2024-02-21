import axios from "axios";
import { apiURL } from "../constants";

const axiosInstance = axios.create({
  baseURL: apiURL,
});

export default axiosInstance;
