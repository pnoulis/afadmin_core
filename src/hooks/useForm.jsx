import * as React from "react";

function useForm(initialState = {}) {
  const [state, dispatch] = React.useReducer(formReducer, {
    ...FORM_SCHEMA,
    ...initialState,
  });

  const proxy = (action, ...payload) => {
    if (action === "reset") {
      dispatch({
        type: "RESET",
        initialState: {
          ...FORM_SCHEMA,
          ...initialState,
        },
      });
    } else if (!Object.hasOwn(actions, action)) {
      throw new Error(`Undefined action:${action} in formReducer`);
    } else {
      dispatch(actions[action](...payload));
    }
  };

  return [state, proxy];
}

function formReducer(state, action) {
  switch (action.type) {
    case "ERRORS":
      return { ...state, errors: action.errors };
    case "INPUT":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.name]:
            action.value.length < 1 ? "" : state.errors[action.name],
        },
        fields: {
          ...state.fields,
          [action.name]: action.value,
        },
      };
    case "RESET":
      return action.initialState;
    case "SUBMIT":
      return {
        ...state,
        submitting: action.submitting,
      };
    default:
      return state;
  }
}
const actions = {
  setErrors: (errors) => ({ type: "ERRORS", errors }),
  setInput: (name, value) => ({ type: "INPUT", name, value }),
  setSubmit: (submitting) => ({ type: "SUBMIT", submitting }),
};

const FormContext = React.createContext({});
const useFormContext = () => {
  const context = React.useContext(FormContext);
  if (context == null) {
    throw new Error("<FormProvider/> missing");
  }
  return context;
};
const FormProvider = ({ value, children }) => {
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

const FORM_SCHEMA = {
  fields: {},
  errors: {},
  submitting: false,
};

export { useForm, FormProvider, useFormContext };
