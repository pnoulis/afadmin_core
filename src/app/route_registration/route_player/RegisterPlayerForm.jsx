import * as React from "react";
import { useForm, FormProvider } from "/src/hooks/index.js";
import { TextInput_0 } from "/src/components/inputs/index.js";
import {
  IconButton,
  IconButtonIcon,
  IconButtonText,
} from "/src/components/buttons/index.js";
import { ReactComponent as SaveIcon } from "/assets/icons/save_1.svg";
import styled from "styled-components";
import { useAfmContext } from "/src/hooks/index.js";

const TextInput = styled(TextInput_0)`
  font-size: var(--tx-sm);
  .input {
    border: 2px solid var(--grey-medium);
    background-color: white;
    border-radius: var(--br-lg);
  }

  .input:focus ~ label,
  input:not(:placeholder-shown) ~ label {
    background-color: white;
  }
`;

function RegisterPlayerForm({ className, ...props }) {
  const { registerPlayer } = useAfmContext("registerPlayer");
  const [form, setForm] = useForm({
    submitting: false,
    fields: {
      name: "",
      surname: "",
      email: "",
      username: "",
      password: "",
    },
  });

  React.useEffect(() => {
    if (!form.submitting) return;
    registerPlayer(form.fields)
      .then((res) => {
        setForm("reset");
        document.activeElement.blur();
      })
      .catch((validationErrors) => {
        if (validationErrors) {
          setForm("setErrors", validationErrors);
        }
      })
      .finally(() => setForm("setSubmit", false));
  }, [form.submitting]);

  return (
    <FormProvider value={{ ...form, setForm }}>
      <form
        className={className}
        id="registerPlayerForm"
        onSubmit={(e) => {
          e.preventDefault();
          setForm("setSubmit", true);
        }}
      >
        <legend>register player</legend>
        <TextInput name="name" label="first name" />
        <TextInput name="surname" label="last name" />
        <TextInput name="email" type="email" />
        <TextInput name="username" />
        <TextInput optional name="password" type="password" />
        <IconButton
          form="registerPlayerForm"
          type="submit"
          disabled={form.submitting}
        >
          <IconButtonIcon>
            <SaveIcon />
          </IconButtonIcon>
          <IconButtonText>save</IconButtonText>
        </IconButton>
      </form>
    </FormProvider>
  );
}

export { RegisterPlayerForm };
