import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import { logoutUser } from "../../../features/user/userSlice";
import styled from "@emotion/styled";
import { IconButton, Typography } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";

interface Props {
  username: string;
}

const StyledLink = styled(Link)(() => ({
  color: "blue",
  textDecoration: "none",
  ["&:hover"]: { color: "inherit" },
}));

export default function UserMenu({ username }: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const dispatch = useAppDispatch();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose(); 
        dispatch(logoutUser());
    };

    return (
        <div>
            <IconButton
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                color="inherit"
                size="large"
            >
                <AccountCircle />
                <Typography variant="subtitle1" component="span">
                    {username}
                </Typography>
            </IconButton>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
            >
                <MenuItem onClick={handleClose}>
                    <Button component={StyledLink} to={"/add-post"}>
                        Add new post
                    </Button>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <Button component={StyledLink} to={"/"}>
                        Logout
                    </Button>
                </MenuItem>
            </Menu>
        </div>
    );
}
