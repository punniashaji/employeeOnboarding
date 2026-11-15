import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, Table, Form, Button, InputGroup, Row, Col, Alert, Badge } from "react-bootstrap";
import api, { getError } from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import MessageToast from "../components/MessageToast";

const departments = ["HR", "IT", "Finance", "Sales", "Operations"];

function EmployeeList() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [order, setOrder] = useState("desc");
  const [error, setError] = useState("");
  const [deleteEmp, setDeleteEmp] = useState(null);

  // message sent from add / edit page
  const location = useLocation();
  const [message, setMessage] = useState(location.state ? location.state.message : "");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    // clear it so refresh does not show it again
    window.history.replaceState({}, "");
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees", {
        params: { page, limit: 10, search, department, sortBy, order },
      });
      setEmployees(res.data.employees);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(getError(err));
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page, search, department, sortBy, order]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchText);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  const sortArrow = (field) => {
    if (sortBy !== field) return "";
    return order === "asc" ? " ▲" : " ▼";
  };

  const handleDelete = async () => {
    const emp = deleteEmp;
    setDeleteEmp(null);
    try {
      await api.delete("/employees/" + emp.id);
      setMessageType("success");
      setMessage(emp.name + " deleted successfully");
      if (employees.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadEmployees();
      }
    } catch (err) {
      setMessageType("danger");
      setMessage(getError(err));
    }
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            Employees <Badge bg="secondary">{total}</Badge>
          </h4>
          <Button as={Link} to="/employees/add">
            + Add Employee
          </Button>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="mb-3 g-2">
          <Col md={6}>
            <Form onSubmit={handleSearch}>
              <InputGroup>
                <Form.Control
                  placeholder="Search by name or email"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Button type="submit" variant="outline-secondary">
                  Search
                </Button>
              </InputGroup>
            </Form>
          </Col>
          <Col md={{ span: 3, offset: 3 }}>
            <Form.Select
              value={department}
              onChange={(e) => {
                setPage(1);
                setDepartment(e.target.value);
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th className="sort" onClick={() => handleSort("name")}>Name{sortArrow("name")}</th>
              <th className="sort" onClick={() => handleSort("email")}>Email{sortArrow("email")}</th>
              <th className="sort" onClick={() => handleSort("department")}>Department{sortArrow("department")}</th>
              <th className="sort" onClick={() => handleSort("designation")}>Designation{sortArrow("designation")}</th>
              <th className="sort" onClick={() => handleSort("joiningDate")}>Joining Date{sortArrow("joiningDate")}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No employees found
                </td>
              </tr>
            )}
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>{emp.designation}</td>
                <td>{emp.joiningDate.slice(0, 10)}</td>
                <td>
                  <Button as={Link} to={"/employees/" + emp.id} size="sm" variant="outline-primary" className="me-1">
                    View
                  </Button>
                  <Button as={Link} to={"/employees/" + emp.id + "/edit"} size="sm" variant="outline-secondary" className="me-1">
                    Edit
                  </Button>
                  {user.role === "admin" && (
                    <Button size="sm" variant="outline-danger" onClick={() => setDeleteEmp(emp)}>
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex justify-content-end align-items-center gap-2">
          <Button size="sm" variant="outline-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button size="sm" variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </Card.Body>

      <ConfirmModal
        show={!!deleteEmp}
        title="Delete Employee"
        message={deleteEmp ? "Are you sure you want to delete " + deleteEmp.name + "?" : ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteEmp(null)}
      />
      <MessageToast message={message} type={messageType} onClose={() => setMessage("")} />
    </Card>
  );
}

export default EmployeeList;
