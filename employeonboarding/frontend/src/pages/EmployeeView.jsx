import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Table, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import api, { getError } from "../api/axios";
import { viewFile, downloadFile } from "../api/files";
import MessageToast from "../components/MessageToast";

function EmployeeView() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const openFile = async (doc) => {
    const done = await viewFile(doc.id);
    if (!done) setMessage("could not open file");
  };

  const saveFile = async (doc) => {
    const done = await downloadFile(doc.id, doc.originalName);
    if (!done) setMessage("could not download file");
  };

  useEffect(() => {
    api
      .get("/employees/" + id)
      .then((res) => {
        setEmployee(res.data);
        const photo = res.data.documents.find((d) => d.type === "photo");
        if (photo) {
          api.get("/files/" + photo.id, { responseType: "blob" }).then((r) => {
            setPhotoUrl(URL.createObjectURL(r.data));
          });
        }
      })
      .catch((err) => setError(getError(err)));
  }, [id]);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!employee) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const resume = employee.documents.find((d) => d.type === "resume");

  const fileButtons = (doc) => (
    <>
      {doc.originalName}
      <Button size="sm" variant="outline-primary" className="ms-2" onClick={() => openFile(doc)}>
        View
      </Button>
      <Button size="sm" variant="outline-secondary" className="ms-1" onClick={() => saveFile(doc)}>
        Download
      </Button>
    </>
  );

  return (
    <Card>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Employee Details</h4>
          <div>
            <Button as={Link} to="/employees" variant="outline-secondary" className="me-2">
              Back
            </Button>
            <Button as={Link} to={"/employees/" + employee.id + "/edit"}>
              Edit
            </Button>
          </div>
        </div>

        <Row className="g-4">
          <Col md="auto">
            {photoUrl ? (
              <img src={photoUrl} alt="profile" className="photo" />
            ) : (
              <div className="photo d-flex align-items-center justify-content-center text-muted">No Photo</div>
            )}
          </Col>
          <Col>
            <Table bordered size="sm">
              <tbody>
                <tr><th style={{ width: 160 }}>Name</th><td>{employee.name}</td></tr>
                <tr><th>Email</th><td>{employee.email}</td></tr>
                <tr><th>Mobile</th><td>{employee.mobile}</td></tr>
                <tr><th>Date of Birth</th><td>{employee.dob.slice(0, 10)}</td></tr>
                <tr><th>Department</th><td>{employee.department}</td></tr>
                <tr><th>Designation</th><td>{employee.designation}</td></tr>
                <tr><th>Joining Date</th><td>{employee.joiningDate.slice(0, 10)}</td></tr>
                <tr><th>Address</th><td>{employee.address}</td></tr>
                <tr><th>Resume</th><td>{resume ? fileButtons(resume) : "-"}</td></tr>
              </tbody>
            </Table>
          </Col>
        </Row>

        <h6 className="section-title">Educational Qualifications</h6>
        <Table bordered size="sm">
          <thead>
            <tr>
              <th>Qualification</th>
              <th>University</th>
              <th>Year of Passing</th>
              <th>Percentage / CGPA</th>
            </tr>
          </thead>
          <tbody>
            {employee.qualifications.length === 0 && (
              <tr><td colSpan="4" className="text-muted">No qualifications added</td></tr>
            )}
            {employee.qualifications.map((q) => (
              <tr key={q.id}>
                <td>{q.qualification}</td>
                <td>{q.university}</td>
                <td>{q.yearOfPassing}</td>
                <td>{q.score}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <h6 className="section-title">Work Experience</h6>
        <Table bordered size="sm">
          <thead>
            <tr>
              <th>Company</th>
              <th>Designation</th>
              <th>From</th>
              <th>To</th>
              <th>Certificate</th>
            </tr>
          </thead>
          <tbody>
            {employee.experiences.length === 0 && (
              <tr><td colSpan="5" className="text-muted">No experience added</td></tr>
            )}
            {employee.experiences.map((exp) => {
              const cert = employee.documents.find((d) => d.experienceId === exp.id);
              return (
                <tr key={exp.id}>
                  <td>{exp.company}</td>
                  <td>{exp.designation}</td>
                  <td>{exp.fromDate.slice(0, 10)}</td>
                  <td>{exp.toDate.slice(0, 10)}</td>
                  <td>{cert ? fileButtons(cert) : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card.Body>
      <MessageToast message={message} type="danger" onClose={() => setMessage("")} />
    </Card>
  );
}

export default EmployeeView;
