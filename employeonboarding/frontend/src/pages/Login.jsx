import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Card, Form, Button, Alert } from "react-bootstrap";
import api, { getError } from "../api/axios";
import { checkEmail } from "../validation";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");

  if (localStorage.getItem("token")) {
    return <Navigate to="/employees" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const msg = checkEmail(email);
    setEmailError(msg);
    if (msg) return;

    try {
      const res = await api.post("/users/login", { email, password });
      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/employees");
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <Card className="auth-card">
      <Card.Body className="p-4">
        <h4 className="mb-1">Employee Onboarding</h4>
        <p className="text-muted mb-4">Login to continue</p>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!!emailError}
            />
            <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Group>
          <Button type="submit" className="w-100">
            Login
          </Button>
        </Form>
        <p className="mt-3 mb-0 text-center">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </Card.Body>
    </Card>
  );
}

export default Login;
