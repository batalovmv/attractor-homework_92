import { useState, ChangeEvent, FormEvent } from "react";
import { Alert, Box, Button, Grid, TextField } from "@mui/material";
import { useParams } from "react-router-dom";

interface State {
  text: string;
  error: string | undefined;
}

interface Props {
  onSubmit: (text: string, postId: number) => void;
}

const CommentForm = (props: Props) => {
  const [state, setState] = useState<State>({
    text: "",
    error: undefined,
  });

  const { id: postId } = useParams();

  const submitFormHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!state.text.trim()) {
      setState((prevState) => ({
        ...prevState,
        error: "Comment cannot be empty!",
      }));

      return;
    }

    if (postId) props.onSubmit(state.text, Number(postId));
    console.log(postId);
  };

  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prevState) => {
      return { ...prevState, [name]: value, error: undefined };
    });
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
        </Grid>

        <Grid item xs>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            id="text"
            label="Enter your comment..."
            value={state.text}
            onChange={inputChangeHandler}
            name="text"
          />
        </Grid>

        <Grid item xs>
          <Button type="submit" color="primary" variant="contained">
            Send comment
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommentForm;
