import { Toast, ToastContainer } from "react-bootstrap";

function MessageToast({ message, type, onClose }) {
  return (
    <ToastContainer position="top-end" className="p-3" style={{ position: "fixed", zIndex: 2000 }}>
      <Toast show={!!message} onClose={onClose} delay={3000} autohide bg={type || "success"}>
        <Toast.Body className="text-white">{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default MessageToast;
