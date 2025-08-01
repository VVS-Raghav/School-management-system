import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 2,
        py: 3,
        px: 2,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderTop: '1px solid #ddd',
      }}
    >
      <Typography variant="h6" color="primary.main" fontWeight={600} gutterBottom>
        School Management System
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Empowering education through technology
      </Typography>

      <Divider sx={{ my: 1, mx: 'auto', width: '20%' }} />

      <Typography variant="caption" color="caption">
        © {new Date().getFullYear()} School Management System. All rights reserved.
      </Typography>
    </Box>
  );
}
