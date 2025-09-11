import { Routes, Route } from "react-router-dom";
import Layout from "../layout/Layout";
import Home from "../pages/Home";
import Products from "../pages/Products";
import Description from "../pages/Description";
import Admin from "../pages/Admin";

export default function Routing() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/description" element={<Description />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
