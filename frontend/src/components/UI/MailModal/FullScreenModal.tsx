import { Box, Modal, Typography } from "@mui/material";

interface FullScreenModalProps {
    open: boolean;
}
function FullScreenModal({ open }: FullScreenModalProps) {
    return (
        <Modal
            open={open}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    bgcolor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                }}
            >
                <Typography id="modal-title" variant="h6" component="h2" align="center" sx={{ maxWidth: '600px' }}>
                    Пожалуйста, проверьте вашу почту для подтверждения регистрации.
                </Typography>
            </Box>
        </Modal>
    );
}
export default FullScreenModal