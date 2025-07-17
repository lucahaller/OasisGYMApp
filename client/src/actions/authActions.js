import axios from "axios";

// Action creators
const authStart = () => ({ type: "AUTH_START" });
const authSuccess = (token, user) => ({
  type: "AUTH_SUCCESS",
  payload: { token, user },
});
const authFail = (error) => ({ type: "AUTH_FAIL", payload: error });
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return { type: "LOGOUT" };
};

// Async login action
export const login = (email, password) => (dispatch) => {
  dispatch(authStart());
  return axios
    .post("http://localhost:3000/api/auth/login", { email, password })
    .then((response) => {
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      dispatch(authSuccess(token, user));
      return user; // para que el then en el componente tenga acceso a user
    })
    .catch((error) => {
      const message =
        error.response?.status === 403
          ? error.response.data.message || "Acceso denegado por pago vencido"
          : error.response?.data?.message || "Error en login";
      dispatch(authFail(message));
      return Promise.reject(message);
    });
};

export const register = (formData) => async (dispatch) => {
  dispatch(authStart());

  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/register",
      formData
    );

    const { token, user } = response.data;

    localStorage.setItem("user", JSON.stringify(user));
    dispatch(authSuccess(token, user));
    return { token, user }; // <- retornamos por claridad
  } catch (error) {
    dispatch(authFail(error.response?.data?.message || "Error al registrarse"));
    // Lanzamos el error completo para que el modal lo pueda manejar
    throw error;
  }
};
