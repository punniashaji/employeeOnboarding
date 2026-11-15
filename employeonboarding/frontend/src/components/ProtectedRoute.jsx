import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import api from "../api/axios";
import AppNavbar from "./Navbar";

function ProtectedRoute({ children, adminOnly }) {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // check token with backend so login stays after refresh
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/users/current")
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return <Navigate to="/login" />;
  }
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/employees" />;
  }

  return (
    <>
      <AppNavbar user={user} />
      <Container className="py-4">{children}</Container>
    </>
  );
}

export default ProtectedRoute;
