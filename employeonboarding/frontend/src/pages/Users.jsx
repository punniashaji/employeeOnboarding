import { useEffect, useState } from "react";
import { Card, Table, Button, Badge, Alert } from "react-bootstrap";
import api, { getError } from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import MessageToast from "../components/MessageToast";

function Users() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [removeTarget, setRemoveTarget] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const showMessage = (text, type) => {
    setMessageType(type);
    setMessage(text);
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      setError(getError(err));
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const approve = async (user) => {
    try {
      await api.put("/users/" + user.id + "/approve");
      showMessage(user.name + " approved", "success");
      loadUsers();
    } catch (err) {
      showMessage(getError(err), "danger");
    }
  };

  const changeRole = async (user) => {
    const role = user.role === "admin" ? "user" : "admin";
    try {
      await api.put("/users/" + user.id + "/role", { role });
      showMessage(user.name + " is now " + role, "success");
      loadUsers();
    } catch (err) {
      showMessage(getError(err), "danger");
    }
  };

  const removeUser = async () => {
    const user = removeTarget;
    setRemoveTarget(null);
    try {
      await api.delete("/users/" + user.id);
      showMessage(user.name + " removed", "success");
      loadUsers();
    } catch (err) {
      showMessage(getError(err), "danger");
    }
  };

  return (
    <Card>
      <Card.Body>
        <h4 className="mb-3">Users</h4>
        {error && <Alert variant="danger">{error}</Alert>}
        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <Badge bg={user.role === "admin" ? "primary" : "secondary"}>{user.role}</Badge>
                </td>
                <td>
                  {user.isApproved ? <Badge bg="success">Approved</Badge> : <Badge bg="warning" text="dark">Pending</Badge>}
                </td>
                <td>
                  {user.id !== currentUser.id && (
                    <>
                      {!user.isApproved && (
                        <Button size="sm" variant="success" className="me-1" onClick={() => approve(user)}>
                          Approve
                        </Button>
                      )}
                      <Button size="sm" variant="outline-primary" className="me-1" onClick={() => changeRole(user)}>
                        {user.role === "admin" ? "Make User" : "Make Admin"}
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => setRemoveTarget(user)}>
                        Remove
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>

      <ConfirmModal
        show={!!removeTarget}
        title="Remove User"
        message={removeTarget ? "Are you sure you want to remove " + removeTarget.name + "?" : ""}
        confirmText="Yes, Remove"
        onConfirm={removeUser}
        onCancel={() => setRemoveTarget(null)}
      />
      <MessageToast message={message} type={messageType} onClose={() => setMessage("")} />
    </Card>
  );
}

export default Users;
