const initialState = {
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        loading: false,
        token: action.payload.token,
        user: action.payload.user,
        error: null,
      };
    case "AUTH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "LOGOUT":
      return { ...state, token: null, user: null, error: null };
    default:
      return state;
  }
};
