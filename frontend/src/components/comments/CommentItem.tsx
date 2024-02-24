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
        <Box m={1} sx={{ background: 'grey.800', borderRadius: 1, color: 'white' }}>
            <Box
                p={1}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bgcolor="grey.900"
                borderRadius="4px 4px 0 0"
            >
                <Typography variant="body2" fontFamily="monospace">
                    {moment(comment.datetime).format("MMM Do YYYY, h:mm a")} by {comment.user.username}
                </Typography>
                {(currentUser && currentUser === comment.user.username) && (
                    <IconButton onClick={onDelete} size="small">
                        <DeleteForever htmlColor="white" />
                    </IconButton>
                )}
            </Box>
            <Typography p={1} bgcolor="grey.700" borderRadius="0 0 4px 4px">
                {comment.text}
            </Typography>
        </Box>
    );
                }
export default CommentItem;
