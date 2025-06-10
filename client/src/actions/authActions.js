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
export const login = (email, password) => async (dispatch) => {
  dispatch(authStart());
  try {
    const response = await axios.post("http://localhost:3000/api/auth/login", {
      email,
      password,
    });
    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    dispatch(authSuccess(token, user));
  } catch (error) {
    dispatch(authFail(error.response?.data?.message || "Error en login"));
  }
};

export const register = (name, email, password) => async (dispatch) => {
  dispatch(authStart());

  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/register",
      {
        name,
        email,
        password,
      }
    );
    console.log(response);
    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    dispatch(authSuccess(token, user));
  } catch (error) {
    dispatch(authFail(error.response?.data?.message || "Error al registrarse"));
  }
};
