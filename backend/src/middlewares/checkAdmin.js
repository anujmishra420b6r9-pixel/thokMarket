export const checkAdmin = (req, res, next) => {
  try {
    // authenticate middleware से user data पहले से मौजूद होगा
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Check if user is admin
    if (user.rank !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can perform this action.",
      });
    }

    // ✅ अगर user admin है तो आगे बढ़े
    next();
  } catch (error) {
    console.error("🔴 checkAdmin Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in admin check.",
    });
  }
};
