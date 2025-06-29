import api from "../axios";

export const register = (firstname: string, lastname: string, email: string, password: string) => {
  return api.post("user/register", {
    firstname,
    lastname,
    email,
    password,
  });
};

export const login = (email: string, password: string) => {
  return api.post("users/login", { email, password }).then((response) => {
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    return response.data;
  });
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};


export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const saveAccessToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export default function authHeader() {
  const token = getAccessToken();
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
}