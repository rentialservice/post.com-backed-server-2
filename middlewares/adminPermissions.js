export const requireAdminPermission = (req, res, next) => {
    const { adminPermissions } = req.body;
    try {
        if (adminPermissions.includes("admins")) {
            next();
        } else {
            throw Error("Not authorized to access admins");
        }
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
}

