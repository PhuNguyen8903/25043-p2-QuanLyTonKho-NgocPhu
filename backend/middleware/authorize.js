const authorize = (allowedRoles) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        if (!req.session.userId || !req.session.userRole) {
            return res.status(401).json({ message: "Không xác định được vai trò người dùng" });
        }

        const userRole = req.session.userRole;
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này" });
        }

        next();
    };
};

module.exports = authorize;