import { Outlet } from "react-router-dom";
import Navbar from "./utility_components/navbar/navbar";
import Footer from "./utility_components/footer/Footer";
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