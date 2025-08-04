import axios from "axios";
import { BASE_URL } from "../constants/urls";

export const registerUser = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, data);
    return { user: res.data.user, token: res.data.token };
  } catch (error) {
    throw error.response?.data?.error || "Registration failed";
  }
};

export const loginUser = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, data);
    return { user: res.data.user, token: res.data.token };
  } catch (error) {
    throw error.response?.data?.error || "Login failed";
  }
};

export const me = async (token) => {
  try {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { user: res.data.user };
  } catch (error) {
    throw error.response?.data?.error || "Login failed";
  }
};
