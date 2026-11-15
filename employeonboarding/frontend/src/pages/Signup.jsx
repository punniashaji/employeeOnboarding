import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Form, Button, Alert } from "react-bootstrap";
import api, { getError } from "../api/axios";
import { checkEmail } from "../validation";

const emptyForm = { name: "", email: "", password: "", confirmPassword: "" };

function Signup() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "name is required";
    const emailMsg = checkEmail(form.email);
    if (emailMsg) errs.email = emailMsg;
    if (form.password.length < 8) errs.password = "password should be at least 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validate()) return;

    try {
      const res = await api.post("/users/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess(res.data.message);
      setForm(emptyForm);
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <Card className="auth-card">
      <Card.Body className="p-4">
        <h4 className="mb-1">Create Account</h4>
        <p className="text-muted mb-4">Admin will approve your account</p>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={form.name} onChange={handleChange} maxLength={50} isInvalid={!!errors.name} />
            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={form.email} onChange={handleChange} isInvalid={!!errors.email} />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" value={form.password} onChange={handleChange} isInvalid={!!errors.password} />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              isInvalid={!!errors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
          </Form.Group>
          <Button type="submit" className="w-100">
            Sign Up
          </Button>
        </Form>
        <p className="mt-3 mb-0 text-center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </Card.Body>
    </Card>
  );
}

export default Signup;
