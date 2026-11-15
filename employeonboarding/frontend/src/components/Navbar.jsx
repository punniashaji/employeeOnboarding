import { NavLink, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

function AppNavbar({ user }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Navbar className="app-navbar" variant="dark" expand="md">
      <Container>
        <Navbar.Brand>Employee Onboarding</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/employees" end>
              Employees
            </Nav.Link>
            <Nav.Link as={NavLink} to="/employees/add">
              Add Employee
            </Nav.Link>
            {user.role === "admin" && (
              <Nav.Link as={NavLink} to="/users">
                Users
              </Nav.Link>
            )}
          </Nav>
          <Navbar.Text className="me-3">
            {user.name} ({user.role})
          </Navbar.Text>
          <Button variant="outline-light" size="sm" onClick={logout}>
            Logout
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
