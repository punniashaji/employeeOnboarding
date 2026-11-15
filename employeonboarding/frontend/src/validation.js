export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const mobileRegex = /^[6-9][0-9]{9}$/;

export const checkEmail = (email) => {
  if (!email) return "email is required";
  if (!emailRegex.test(email)) return "enter a valid email (example: name@gmail.com)";
  return "";
};

export const checkMobile = (mobile) => {
  if (!mobile) return "mobile number is required";
  if (mobile.length !== 10) return "mobile number should be 10 digits";
  if (!mobileRegex.test(mobile)) return "mobile number should start with 6, 7, 8 or 9";
  return "";
};
