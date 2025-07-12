import { Outlet } from "react-router-dom";
import Navbar from "./utility_components/navbar/Navbar.jsx";
import Footer from "./utility_components/footer/Footer.jsx";
import Box from "@mui/material/Box";

export default function Client() {
  return (
    <div>
        <Navbar />
        <Box component={'div'} sx={{ minHeight:'80vh'}}>
            <Outlet />
        </Box>
        <Footer />
    </div>
  );
}