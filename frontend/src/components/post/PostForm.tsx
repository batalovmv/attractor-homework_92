import { useState, ChangeEvent, FormEvent } from "react";
import { Alert, Box, Button, CircularProgress, Grid, TextField } from "@mui/material";
import FileInput from "../Form/FileInput";

interface State {
  title: string;
  description: string;
  image: string;
  error: string | undefined;
}

interface Props {
  onSubmit: (data: FormData) => void;
}

const ProductForm = (props: Props) => {
  const [state, setState] = useState<State>({
    title: "",
    description: "",
    image: "",
    error: undefined,
  });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitFormHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!state.title) {
            setState((prevState) => ({
                ...prevState,
                error: "Title cannot be empty!",
            }));
            return;
        }


    if (!state.description.trim() && !state.image) {
      setState((prevState) => ({
        ...prevState,
        error: "You must fill in one of the fields: description or image",
      }));

      return;
    }
        setIsSubmitting(true); // Начало отправки данных
        try {
            const formData = new FormData();

            Object.entries(state).forEach(([key, value]) => {
                formData.append(key, value);
            });

            await props.onSubmit(formData); // Ожидаем выполнение функции onSubmit
        } finally {
            setIsSubmitting(false); // Завершение отправки данных
        }
    const formData = new FormData();

    Object.entries(state).forEach(([key, value]) => {
      formData.append(key, value);
    });

    props.onSubmit(formData);
  };

  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prevState) => {
      return { ...prevState, [name]: value ,error: undefined };
    });
  };

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files ? e.target.files[0] : "";

    setState((prevState) => ({
      ...prevState,
      [name]: file,
    }));
  };

  return (
      <Box
          component={"form"}
          autoComplete="off"
          onSubmit={submitFormHandler}
          paddingY={2}
      >
      <Grid container direction="column" spacing={2}>
        <Grid item xs>
				{state.error ? (
          <Alert sx={{ width: "100%", m: 2 }} severity="error">
            {state.error}
          </Alert>
        ) : null}

          <TextField
            fullWidth
            variant="outlined"
            id="title"
            label="Title"
            value={state.title}
            onChange={inputChangeHandler}
            name="title"
          />
        </Grid>

        <Grid item xs>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            id="description"
            label="Description"
            value={state.description}
            onChange={inputChangeHandler}
            name="description"
          />
        </Grid>
        <Grid item xs>
          <FileInput name="image" onChange={fileChangeHandler} label="Image" />
        </Grid>

        <Grid item xs>
                  <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      disabled={isSubmitting}
                  >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Create Post'}
                  </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm;
