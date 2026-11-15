import api from "./axios";

// files need token so we get them as blob
// both return true if it worked, false if not

export const viewFile = async (id) => {
  const win = window.open("", "_blank");
  try {
    const res = await api.get("/files/" + id, { responseType: "blob" });
    win.location.href = URL.createObjectURL(res.data);
    return true;
  } catch (error) {
    win.close();
    return false;
  }
};

export const downloadFile = async (id, name) => {
  try {
    const res = await api.get("/files/" + id, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    return false;
  }
};
