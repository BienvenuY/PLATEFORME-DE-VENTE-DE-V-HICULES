import "./App.css";
import { Route, Routes, Navigate } from "react-router";
import MainLayout from "./components/layouts/MainLayout";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetail from "./pages/CarDetail";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import PrivateRoute from "./components/routes/PrivateRoute";
import AdminRoute from "./components/routes/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCars from "./pages/admin/AdminCars";
import AdminCarForm from "./pages/admin/AdminCarForm";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHomeSpotlight from "./pages/admin/AdminHomeSpotlight";
import NotificationsPage from "./pages/NotificationsPage";
import MesReservations from "./pages/MesReservations";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route
          path="voitures"
          element={
            <PrivateRoute>
              <Cars />
            </PrivateRoute>
          }
        />
        <Route
          path="voitures/:id"
          element={
            <PrivateRoute>
              <CarDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="favoris"
          element={
            <PrivateRoute>
              <Favorites />
            </PrivateRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <PrivateRoute>
              <NotificationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="mes-reservations"
          element={
            <PrivateRoute>
              <MesReservations />
            </PrivateRoute>
          }
        />
        <Route path="admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboard />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="contacts" element={<AdminLeads />} />
          <Route path="utilisateurs" element={<AdminUsers />} />
          <Route path="voitures" element={<AdminCars />} />
          <Route path="accueil-vedette" element={<AdminHomeSpotlight />} />
          <Route path="voitures/nouveau" element={<AdminCarForm />} />
          <Route path="voitures/:id" element={<AdminCarForm />} />
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
