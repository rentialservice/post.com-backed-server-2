import dotenv from "dotenv";
dotenv.config();

import {Admin,Permission,Role} from "../sequelize.js"

import jwt from "jsonwebtoken";

const requireAdminAuth = async (req, res, next) => {

    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "Access token required" });
    }
    const token = authorization.split(" ")[1];
    try {
        const data = jwt.verify(token, process.env.SECRET_KEY);

        if (!data.adminId || !data.roleId) throw Error("Not Authorized");

        const admin = await Admin.findOne({ where: { adminId: data.adminId } });

        if (!admin) throw Error("Admin does not exist");
        req.body.adminId = data.adminId;

        const allPermissions = await Permission.findAll({
            include: {
                model: Role,
                required: true,
                attributes: [],
                through: {
                    attributes: [],
                    where: {
                        roleId: data.roleId,
                    }
                }
            }
        });

        const permissions = allPermissions.map((ap) => ap.name);
        req.body.adminPermissions = permissions;
        next();
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
}

export default requireAdminAuth;