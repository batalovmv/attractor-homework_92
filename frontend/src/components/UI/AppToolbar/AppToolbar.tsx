import { AppBar, Box, Button, Grid, Toolbar, Typography, styled } from "@mui/material";
import { Link } from "react-router-dom";
import UserMenu from "../Menu/UserMenu";
import { useAppSelector } from "../../../store/hooks";

const StyledLink = styled(Link)(() => ({
  color: "blue",
  textDecoration: "none",
  ["&:hover"]: { color: "inherit" },
}));

const AppToolbar = () => {
    const user = useAppSelector((state) => state.user.userInfo);

    return (
        <>
            <AppBar position="fixed">
                <Toolbar>
                    <Grid container direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                        <Typography variant="h6" component={StyledLink} to={"/"}>
                            Forum App
                        </Typography>
                        {user ? (
                            <>
                                <Button component={StyledLink} to={"/add-post"}>
                                    Add new post
                                </Button>
                                <UserMenu username={user.username} />
                            </>
                        ) : (
                            <Grid item>
                                <Button component={StyledLink} to={"/register"}>
                                    Register
                                </Button>
                                or
                                <Button component={StyledLink} to={"/login"}>
                                    Login
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Toolbar>
            </AppBar>
            <Box component={Toolbar} marginBottom={2} />
        </>
    );
};

export default AppToolbar;