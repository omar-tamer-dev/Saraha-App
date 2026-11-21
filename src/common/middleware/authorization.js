export const authorization = (roles = []) => {
  return async (req, res, next) => {
    console.log("user role:", req.user.role, "| allowed:", roles);

    if (!roles.includes(req.user.role)) {
      throw new Error("Unauthorized", { cause: 401 });
    }

    next();
  };
};