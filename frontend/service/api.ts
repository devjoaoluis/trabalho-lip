import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3300",
});

// Dispatch session-expired event on 401 so any mounted modal can react
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status =
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response
        ? (error.response as { status: number }).status
        : null;

    if (status === 401) {
      // Only fire if user is still logged in (token exists)
      if (localStorage.getItem("accessToken")) {
        window.dispatchEvent(new Event("session:expired"));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
