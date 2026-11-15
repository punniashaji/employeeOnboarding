import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Row, Col, Button, Alert } from "react-bootstrap";
import api, { getError } from "../api/axios";
import { checkEmail, checkMobile } from "../validation";

const departments = ["HR", "IT", "Finance", "Sales", "Operations"];
const maxSize = 5 * 1024 * 1024;
const currentYear = new Date().getFullYear();

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  dob: "",
  department: "",
  designation: "",
  joiningDate: "",
  address: "",
};

// check file type and size before upload
const checkFile = (file, allowed) => {
  const ext = file.name.split(".").pop().toLowerCase();
  if (!allowed.includes(ext)) {
    return "only " + allowed.join(", ") + " files are allowed";
  }
  if (file.size > maxSize) {
    return "file size should not be more than 5MB";
  }
  return "";
};

function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [qualifications, setQualifications] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [resume, setResume] = useState(null);
  const [oldPhoto, setOldPhoto] = useState(null);
  const [oldResume, setOldResume] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [fileErrors, setFileErrors] = useState({});
  const [emailTaken, setEmailTaken] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // load employee data for edit
  useEffect(() => {
    if (!id) return;
    api
      .get("/employees/" + id)
      .then((res) => {
        const emp = res.data;
        setForm({
          name: emp.name,
          email: emp.email,
          mobile: emp.mobile,
          dob: emp.dob.slice(0, 10),
          department: emp.department,
          designation: emp.designation,
          joiningDate: emp.joiningDate.slice(0, 10),
          address: emp.address,
        });
        setQualifications(
          emp.qualifications.map((q) => ({
            qualification: q.qualification,
            university: q.university,
            yearOfPassing: q.yearOfPassing,
            score: q.score,
          }))
        );
        setExperiences(
          emp.experiences.map((e) => ({
            id: e.id,
            company: e.company,
            designation: e.designation,
            fromDate: e.fromDate.slice(0, 10),
            toDate: e.toDate.slice(0, 10),
            certificate: null,
            oldCertificate: emp.documents.find((d) => d.experienceId === e.id) || null,
            removeCertificate: false,
          }))
        );
        setOldPhoto(emp.documents.find((d) => d.type === "photo") || null);
        setOldResume(emp.documents.find((d) => d.type === "resume") || null);
      })
      .catch((err) => setError(getError(err)));
  }, [id]);

  // check every field, runs on each change so errors show while typing
  const getErrors = () => {
    const errs = {};
    const today = new Date().toISOString().slice(0, 10);

    if (!form.name.trim()) errs.name = "name is required";
    else if (!/^[a-zA-Z .]+$/.test(form.name)) errs.name = "name should contain only letters";

    const emailMsg = checkEmail(form.email);
    if (emailMsg) errs.email = emailMsg;
    else if (emailTaken) errs.email = emailTaken;

    const mobileMsg = checkMobile(form.mobile);
    if (mobileMsg) errs.mobile = mobileMsg;

    if (!form.dob) errs.dob = "date of birth is required";
    else if (form.dob >= today) errs.dob = "date of birth should be before today";

    if (!form.department) errs.department = "select a department";
    if (!form.designation.trim()) errs.designation = "designation is required";

    if (!form.joiningDate) errs.joiningDate = "joining date is required";
    else if (form.dob && form.joiningDate <= form.dob) errs.joiningDate = "joining date should be after date of birth";

    if (!form.address.trim()) errs.address = "address is required";
    if (!resume && !oldResume) errs.resume = "resume is required";

    qualifications.forEach((q, i) => {
      if (!q.qualification.trim()) errs["q" + i + "qualification"] = "required";
      if (!q.university.trim()) errs["q" + i + "university"] = "required";

      const year = Number(q.yearOfPassing);
      if (q.yearOfPassing === "") errs["q" + i + "yearOfPassing"] = "required";
      else if (!Number.isInteger(year) || year < 1950 || year > currentYear)
        errs["q" + i + "yearOfPassing"] = "year should be between 1950 and " + currentYear;

      const score = Number(q.score);
      if (q.score === "") errs["q" + i + "score"] = "required";
      else if (isNaN(score) || score < 0 || score > 100) errs["q" + i + "score"] = "should be between 0 and 100";
    });

    experiences.forEach((exp, i) => {
      if (!exp.company.trim()) errs["e" + i + "company"] = "required";
      if (!exp.designation.trim()) errs["e" + i + "designation"] = "required";
      if (!exp.fromDate) errs["e" + i + "fromDate"] = "required";
      else if (form.dob && exp.fromDate <= form.dob) errs["e" + i + "fromDate"] = "should be after date of birth";
      if (!exp.toDate) errs["e" + i + "toDate"] = "required";
      else if (exp.fromDate && exp.toDate < exp.fromDate) errs["e" + i + "toDate"] = "should be after from date";
    });

    return errs;
  };

  const errors = getErrors();

  // show error when user typed something, or after save is clicked
  const showError = (key, value) => {
    if (!errors[key]) return "";
    if (submitted || String(value ?? "") !== "") return errors[key];
    return "";
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEmailChange = (e) => {
    setEmailTaken("");
    setForm({ ...form, email: e.target.value });
  };

  // when user leaves email box, ask server if email is already used
  const checkEmailTaken = async () => {
    if (checkEmail(form.email)) return;
    try {
      const res = await api.get("/employees/check-email", { params: { email: form.email, id: id } });
      if (res.data.exists) {
        setEmailTaken("employee with this email already exists");
      }
    } catch (err) {
      // server will check again on save
    }
  };

  const goToEmail = () => {
    const input = document.getElementsByName("email")[0];
    input.scrollIntoView({ block: "center" });
    input.focus();
  };

  // only numbers, max 10
  const handleMobile = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setForm({ ...form, mobile: value });
  };

  // qualifications
  const addQualification = () => {
    setQualifications([...qualifications, { qualification: "", university: "", yearOfPassing: "", score: "" }]);
  };

  const removeQualification = (index) => {
    setQualifications(qualifications.filter((q, i) => i !== index));
  };

  const changeQualification = (index, field, value) => {
    if (field === "yearOfPassing") {
      value = value.replace(/[^0-9]/g, "").slice(0, 4);
    }
    const list = [...qualifications];
    list[index] = { ...list[index], [field]: value };
    setQualifications(list);
  };

  // experiences
  const addExperience = () => {
    setExperiences([
      ...experiences,
      { id: null, company: "", designation: "", fromDate: "", toDate: "", certificate: null, oldCertificate: null, removeCertificate: false },
    ]);
  };

  const removeExperience = (index) => {
    setExperiences(experiences.filter((e, i) => i !== index));
  };

  const changeExperience = (index, field, value) => {
    const list = [...experiences];
    list[index] = { ...list[index], [field]: value };
    setExperiences(list);
  };

  const selectCertificate = (index, file) => {
    if (!file) return;
    const msg = checkFile(file, ["pdf", "jpg", "jpeg", "png"]);
    setFileErrors({ ...fileErrors, ["cert" + index]: msg });
    if (msg) return;
    changeExperience(index, "certificate", file);
  };

  const removeOldCertificate = (index) => {
    const list = [...experiences];
    list[index] = { ...list[index], oldCertificate: null, removeCertificate: true };
    setExperiences(list);
  };

  const selectPhoto = (file) => {
    if (!file) return;
    const msg = checkFile(file, ["jpg", "jpeg", "png"]);
    setFileErrors({ ...fileErrors, photo: msg });
    if (msg) return;
    setPhoto(file);
  };

  const selectResume = (file) => {
    if (!file) return;
    const msg = checkFile(file, ["pdf", "doc", "docx"]);
    setFileErrors({ ...fileErrors, resume: msg });
    if (msg) return;
    setResume(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      setError("please correct the errors in the form");
      if (errors.email) {
        goToEmail();
      } else {
        window.scrollTo(0, 0);
      }
      return;
    }

    const data = new FormData();
    for (const key in form) {
      data.append(key, form[key]);
    }
    data.append("qualifications", JSON.stringify(qualifications));
    data.append(
      "experiences",
      JSON.stringify(
        experiences.map((exp) => ({
          id: exp.id,
          company: exp.company,
          designation: exp.designation,
          fromDate: exp.fromDate,
          toDate: exp.toDate,
          removeCertificate: exp.removeCertificate,
        }))
      )
    );
    if (photo) data.append("photo", photo);
    if (removePhoto) data.append("removePhoto", "true");
    if (resume) data.append("resume", resume);
    experiences.forEach((exp, i) => {
      if (exp.certificate) data.append("certificate" + i, exp.certificate);
    });

    setSaving(true);
    try {
      if (id) {
        await api.put("/employees/" + id, data);
        navigate("/employees", { state: { message: "Employee updated successfully" } });
      } else {
        await api.post("/employees", data);
        navigate("/employees", { state: { message: "Employee saved successfully" } });
      }
    } catch (err) {
      const msg = getError(err);
      setSaving(false);
      // show duplicate email under the email box
      if (msg.includes("email already exists")) {
        setEmailTaken(msg);
        setError("please correct the errors in the form");
        goToEmail();
        return;
      }
      setError(msg);
      window.scrollTo(0, 0);
    }
  };

  return (
    <Card>
      <Card.Body className="p-4">
        <h4>{id ? "Edit Employee" : "Add Employee"}</h4>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit} noValidate>
          <h6 className="section-title">Basic Details</h6>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Employee Name</Form.Label>
              <Form.Control name="name" value={form.name} onChange={handleChange} maxLength={50} isInvalid={!!showError("name", form.name)} />
              <Form.Control.Feedback type="invalid">{showError("name", form.name)}</Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleEmailChange}
                onBlur={checkEmailTaken}
                maxLength={100}
                isInvalid={!!showError("email", form.email)}
              />
              <Form.Control.Feedback type="invalid">{showError("email", form.email)}</Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control name="mobile" value={form.mobile} onChange={handleMobile} placeholder="10 digit number" isInvalid={!!showError("mobile", form.mobile)} />
              <Form.Control.Feedback type="invalid">{showError("mobile", form.mobile)}</Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control type="date" name="dob" value={form.dob} onChange={handleChange} isInvalid={!!showError("dob", form.dob)} />
              <Form.Control.Feedback type="invalid">{showError("dob", form.dob)}</Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Department</Form.Label>
              <Form.Select name="department" value={form.department} onChange={handleChange} isInvalid={!!showError("department", form.department)}>
                <option value="">Select</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{showError("department", form.department)}</Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Designation</Form.Label>
              <Form.Control name="designation" value={form.designation} onChange={handleChange} maxLength={50} isInvalid={!!showError("designation", form.designation)} />
              <Form.Control.Feedback type="invalid">{showError("designation", form.designation)}</Form.Control.Feedback>
            </Col>
            <Col md={6}>
              <Form.Label>Joining Date</Form.Label>
              <Form.Control type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} isInvalid={!!showError("joiningDate", form.joiningDate)} />
              <Form.Control.Feedback type="invalid">{showError("joiningDate", form.joiningDate)}</Form.Control.Feedback>
            </Col>
            <Col md={12}>
              <Form.Label>Address</Form.Label>
              <Form.Control as="textarea" rows={2} name="address" value={form.address} onChange={handleChange} maxLength={250} isInvalid={!!showError("address", form.address)} />
              <Form.Control.Feedback type="invalid">{showError("address", form.address)}</Form.Control.Feedback>
            </Col>
          </Row>

          <h6 className="section-title">Documents</h6>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Profile Photo (jpg, png - max 5MB)</Form.Label>
              {photo ? (
                <div>
                  Selected: {photo.name}{" "}
                  <Button size="sm" variant="link" className="text-danger" onClick={() => setPhoto(null)}>
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  {oldPhoto && !removePhoto && (
                    <div className="mb-1">
                      Current: {oldPhoto.originalName}{" "}
                      <Button size="sm" variant="link" className="text-danger" onClick={() => setRemovePhoto(true)}>
                        Remove
                      </Button>
                    </div>
                  )}
                  <Form.Control
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => selectPhoto(e.target.files[0])}
                    isInvalid={!!fileErrors.photo}
                  />
                  <Form.Control.Feedback type="invalid">{fileErrors.photo}</Form.Control.Feedback>
                </>
              )}
            </Col>
            <Col md={6}>
              <Form.Label>Resume (pdf, doc, docx - max 5MB)</Form.Label>
              {resume ? (
                <div>
                  Selected: {resume.name}{" "}
                  <Button size="sm" variant="link" className="text-danger" onClick={() => setResume(null)}>
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  {oldResume && <div className="mb-1">Current: {oldResume.originalName} (choose a file to replace)</div>}
                  <Form.Control
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => selectResume(e.target.files[0])}
                    isInvalid={!!fileErrors.resume || (submitted && !!errors.resume)}
                  />
                  <Form.Control.Feedback type="invalid">{fileErrors.resume || errors.resume}</Form.Control.Feedback>
                </>
              )}
            </Col>
          </Row>

          <h6 className="section-title">Educational Qualifications</h6>
          {qualifications.map((q, index) => (
            <Row className="g-2 mb-2" key={index}>
              <Col md={3}>
                <Form.Control
                  placeholder="Qualification"
                  value={q.qualification}
                  onChange={(e) => changeQualification(index, "qualification", e.target.value)}
                  maxLength={100}
                  isInvalid={!!showError("q" + index + "qualification", q.qualification)}
                />
                <Form.Control.Feedback type="invalid">{showError("q" + index + "qualification", q.qualification)}</Form.Control.Feedback>
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="University"
                  value={q.university}
                  onChange={(e) => changeQualification(index, "university", e.target.value)}
                  maxLength={100}
                  isInvalid={!!showError("q" + index + "university", q.university)}
                />
                <Form.Control.Feedback type="invalid">{showError("q" + index + "university", q.university)}</Form.Control.Feedback>
              </Col>
              <Col md={2}>
                <Form.Control
                  placeholder="Year of Passing"
                  value={q.yearOfPassing}
                  onChange={(e) => changeQualification(index, "yearOfPassing", e.target.value)}
                  isInvalid={!!showError("q" + index + "yearOfPassing", q.yearOfPassing)}
                />
                <Form.Control.Feedback type="invalid">{showError("q" + index + "yearOfPassing", q.yearOfPassing)}</Form.Control.Feedback>
              </Col>
              <Col md={2}>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="Percentage / CGPA"
                  value={q.score}
                  onChange={(e) => changeQualification(index, "score", e.target.value)}
                  isInvalid={!!showError("q" + index + "score", q.score)}
                />
                <Form.Control.Feedback type="invalid">{showError("q" + index + "score", q.score)}</Form.Control.Feedback>
              </Col>
              <Col md={2}>
                <Button variant="outline-danger" className="w-100" onClick={() => removeQualification(index)}>
                  Remove
                </Button>
              </Col>
            </Row>
          ))}
          {qualifications.length < 10 && (
            <Button variant="outline-primary" size="sm" onClick={addQualification}>
              + Add Qualification
            </Button>
          )}

          <h6 className="section-title">Work Experience</h6>
          {experiences.map((exp, index) => (
            <Card className="mb-3 bg-light exp-box" key={index}>
              <Card.Body>
                <Row className="g-2">
                  <Col md={3}>
                    <Form.Control
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => changeExperience(index, "company", e.target.value)}
                      maxLength={100}
                      isInvalid={!!showError("e" + index + "company", exp.company)}
                    />
                    <Form.Control.Feedback type="invalid">{showError("e" + index + "company", exp.company)}</Form.Control.Feedback>
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      placeholder="Designation"
                      value={exp.designation}
                      onChange={(e) => changeExperience(index, "designation", e.target.value)}
                      maxLength={50}
                      isInvalid={!!showError("e" + index + "designation", exp.designation)}
                    />
                    <Form.Control.Feedback type="invalid">{showError("e" + index + "designation", exp.designation)}</Form.Control.Feedback>
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="date"
                      title="From Date"
                      value={exp.fromDate}
                      onChange={(e) => changeExperience(index, "fromDate", e.target.value)}
                      isInvalid={!!showError("e" + index + "fromDate", exp.fromDate)}
                    />
                    <Form.Control.Feedback type="invalid">{showError("e" + index + "fromDate", exp.fromDate)}</Form.Control.Feedback>
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="date"
                      title="To Date"
                      value={exp.toDate}
                      onChange={(e) => changeExperience(index, "toDate", e.target.value)}
                      isInvalid={!!showError("e" + index + "toDate", exp.toDate)}
                    />
                    <Form.Control.Feedback type="invalid">{showError("e" + index + "toDate", exp.toDate)}</Form.Control.Feedback>
                  </Col>
                  <Col md={2}>
                    <Button variant="outline-danger" className="w-100" onClick={() => removeExperience(index)}>
                      Remove
                    </Button>
                  </Col>
                </Row>
                <Form.Label className="mt-2 mb-1 small">Experience Certificate (pdf, jpg, png - max 5MB)</Form.Label>
                {exp.certificate ? (
                  <div>
                    Selected: {exp.certificate.name}{" "}
                    <Button size="sm" variant="link" className="text-danger" onClick={() => changeExperience(index, "certificate", null)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    {exp.oldCertificate && (
                      <div className="mb-1">
                        Current: {exp.oldCertificate.originalName}{" "}
                        <Button size="sm" variant="link" className="text-danger" onClick={() => removeOldCertificate(index)}>
                          Remove
                        </Button>
                      </div>
                    )}
                    <Form.Control
                      type="file"
                      size="sm"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => selectCertificate(index, e.target.files[0])}
                      isInvalid={!!fileErrors["cert" + index]}
                    />
                    <Form.Control.Feedback type="invalid">{fileErrors["cert" + index]}</Form.Control.Feedback>
                  </>
                )}
              </Card.Body>
            </Card>
          ))}
          {experiences.length < 10 && (
            <Button variant="outline-primary" size="sm" onClick={addExperience}>
              + Add Experience
            </Button>
          )}

          <div className="mt-4 pt-3 border-top">
            <Button type="submit" disabled={saving} className="me-2">
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate("/employees")}>
              Cancel
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default EmployeeForm;
