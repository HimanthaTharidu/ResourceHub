import { useState } from "react";
import { Route, Routes, Navigate, BrowserRouter } from "react-router-dom";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResourceDetailsPage from "./pages/resources/ResourceDetailsPage";
import ResourceListPage from "./pages/resources/ResourceListPage";
import ProtectedRoute from "./components/AuthProvider";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import ResourceFormPage from "./pages/admin/ResourceFormPage";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/resources" element={<ResourceListPage />} />
        <Route path="/resources/:id" element={<ResourceDetailsPage />} />
      </Route>

      <Route>
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/resources/new" element={<ResourceFormPage/>}/>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
