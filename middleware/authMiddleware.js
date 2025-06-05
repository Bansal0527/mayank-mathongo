const isAdmin = (req, res, next) => {
  // For simplicity, checking for a hardcoded API key in the header
  // In a real application, use proper authentication (e.g., JWT, sessions)
  const adminApiKey = req.headers["x-admin-api-key"];

  if (!adminApiKey || adminApiKey !== process.env.ADMIN_API_KEY) {
    return res
      .status(403)
      .json({ message: "Forbidden - Admin access required" });
  }

  next(); // Proceed to the next middleware or route handler
};

module.exports = {
  isAdmin,
};
