import { Navigate, Route, Routes } from "react-router-dom";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResourceDetailsPage from "./pages/resources/ResourceDetailsPage";
import ResourceListPage from "./pages/resources/ResourceListPage";
import ProtectedRoute from "./components/AuthProvider";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ManageReservationsPage from "./pages/admin/ManageReservationsPage";
import ManageResourcesPage from "./pages/admin/ManageResourcesPage";
import ResourceFormPage from "./pages/admin/ResourceFormPage";
import AppLayout from "./layouts/AppLayout";
import MyReservationsPage from "./pages/reservations/MyReservationsPage";
import CreateReservationPage from "./pages/reservations/CreateReservationPage";
import ReservationDetailsPage from "./pages/reservations/ReservationDetailsPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/resources" replace />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resources" element={<ResourceListPage />} />
          
          <Route path="/reservations" element={<MyReservationsPage/>}/>
          <Route path="/reservations/new" element={<CreateReservationPage/>}/>
          <Route path="/reservations/:id/edit" element={<CreateReservationPage/>}/>
          <Route path="/reservations/:id" element={<ReservationDetailsPage/>}/>

          <Route />


          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/resources" element={<ManageResourcesPage />} />
            <Route path="/admin/resources/new" element={<ResourceFormPage />} />
            <Route path="/admin/resources/:id/edit" element={<ResourceFormPage />} />
            <Route path="/admin/reservations" element={<ManageReservationsPage />} />
            <Route path="/admin/reservations/:id" element={<ReservationDetailsPage />}/>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/resources" replace />} />
    </Routes>
  );
}

export default App;
