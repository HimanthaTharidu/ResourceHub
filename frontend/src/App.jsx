import { useState } from "react";
import { Route, Routes, Navigate, BrowserRouter } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResourcePage from "./pages/ResourcePage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resources" element={<ResourcePage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
