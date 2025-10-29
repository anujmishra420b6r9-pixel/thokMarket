export const checkMaster = (req, res, next) => {
  try {
    // authenticate middleware ने पहले ही req.user बना दिया होगा
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Check if user is master
    if (user.rank !== "master") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only master admin can perform this action.",
      });
    }

    // ✅ If master, allow to proceed
    next();
  } catch (error) {
    console.error("🔴 checkMaster Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in master check.",
    });
  }
};
