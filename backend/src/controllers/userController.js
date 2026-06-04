const db = require("../config/db");

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        appointments: {
          orderBy: { date: "desc" },
        },
        healthPlans: {
          orderBy: { createdAt: "desc" },
        },
        conversations: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};
