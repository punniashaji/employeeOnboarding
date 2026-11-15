import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmployeeList from "./pages/EmployeeList";
import EmployeeForm from "./pages/EmployeeForm";
import EmployeeView from "./pages/EmployeeView";
import Users from "./pages/Users";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/employees" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
      <Route path="/employees/add" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
      <Route path="/employees/:id" element={<ProtectedRoute><EmployeeView /></ProtectedRoute>} />
      <Route path="/employees/:id/edit" element={<ProtectedRoute><EmployeeForm /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute adminOnly={true}><Users /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/employees" />} />
    </Routes>
  );
}

export default App;
