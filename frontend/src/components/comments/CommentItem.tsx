import { MouseEventHandler } from "react";
import { IComment } from "../../interfaces/IComment";
import { Box, IconButton, Typography } from "@mui/material";
import moment from "moment";
import { DeleteForever } from "@mui/icons-material";
import { RootState } from "../../store";
import { useAppSelector } from "../../store/hooks";

interface Props {
  comment: IComment;
  onDelete: MouseEventHandler<HTMLButtonElement>;
}

const CommentItem = ({ comment, onDelete }: Props) => {
  const currentUser = useAppSelector((state: RootState) => state.user.userInfo?.username);

  return (
    <Box m={1} sx={{ background: "pink", borderRadius: 1 }}>
      <Box
        sx={{ background: "black" }}
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Typography
          color={"white"}
          fontFamily={"monospace"}
          fontSize={"15px"}
        >{`${moment(comment.datetime).format("MMM Do YYYY, h:mm a")} by ${
          comment.user.username
        }`}</Typography>
        {(currentUser && currentUser === comment.user.username ) && ( 
          <IconButton onClick={onDelete}>
            <DeleteForever />
          </IconButton>
        )}
      </Box>
      <Typography color={"black"} padding={1}>
        {comment.text}
      </Typography>
    </Box>
  );
};

export default CommentItem;
