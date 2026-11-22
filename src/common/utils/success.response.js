

export const success_response = ({
  res,
  statuscode,
  message = "Done",
  data,
} = {}) => {
  return res.status(statuscode || 200).json({ message, data });
};