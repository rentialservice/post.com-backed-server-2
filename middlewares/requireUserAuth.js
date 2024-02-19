import dotenv from "dotenv";
dotenv.config();

import {User} from "../sequelize.js"

import jwt from "jsonwebtoken";

const requireUserAuth = async (req, res, next) => {

    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "Access token required" });
    }
    const token = authorization.split(" ")[1];
    try {
        const data = jwt.verify(token, process.env.SECRET_KEY);
        if (!data.email) throw Error("Not authorized");

        const user = await User.findOne({ where: { email: data.email } });

        if (!user) throw Error("User does not exist");
        req.user = user;

        next();
    } catch (error) {
        console.log(error)
        res.status(401).json({ error: error.message });
    }
}

export default requireUserAuth;