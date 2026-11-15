import { Modal, Button } from "react-bootstrap";

function ConfirmModal({ show, title, message, confirmText, onConfirm, onCancel }) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmText || "Yes, Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
