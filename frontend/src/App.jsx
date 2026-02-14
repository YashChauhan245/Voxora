import React from 'react'
import HomePage from './pages/HomePage'
import { Routes, Route ,Navigate } from "react-router";
import { axiosInstance } from './lib/axios';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import { useQuery } from "@tanstack/react-query";

const App = () => {
  const {
    data: authData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    },
    retry: false, // auth check
  });

  const authUser = authData?.user;

  return (
      <div className="h-screen" data-theme="night">
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    );

}

export default App