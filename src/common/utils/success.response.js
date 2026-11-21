

export const success_response = ({
res,
statuscode,
message = "Done"
} = {}) => {
      return res.status(statuscode || 200).json({ message, Data });
}