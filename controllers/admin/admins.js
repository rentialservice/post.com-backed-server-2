import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { removeNullValues } from "../../utils/utils.js";
import { Admin,Role,Permission,Blacklist } from "../../sequelize.js"

export const newAccessTokenGenerationAdmin = async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ error: "Refresh token required" });
    }
    const refreshToken = authorization.split(" ")[1];

    // check refresh token recieved
    if (!refreshToken) throw Error("Refresh token not found");

    // extract data from jwt
    const data = jwt.verify(refreshToken, process.env.SECRET_KEY);
    if (!data.adminId || !data.roleId) throw Error("Invalid refresh token");

    const blacklistedRefreshToken = await Blacklist.findOne({
      where: { refreshToken: refreshToken },
    });

    if (blacklistedRefreshToken) throw Error("Refresh Token is expired");

    const newAccessToken = jwt.sign(
      {
        adminId: data.adminId,
        roleId: data.roleId,
      },
      process.env.SECRET,
      { expiresIn: "5m" }
    );

    const newRefreshToken = jwt.sign(
      {
        adminId: data.adminId,
        roleId: data.roleId,
      },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    const newblacklistedRefreshToken = await Blacklist.create({
      refreshToken: refreshToken,
    });

    if (!newblacklistedRefreshToken) throw Error("Something went wrong...!");

    // Send a response.
    res.status(200).json({
      message:
        "You have been successfully generated new access token and new refresh token for admin",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const adminAddRootAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // check if rootAdmin already exists
    const checkRootAdmin = await Admin.findAndCountAll({
      where: {
        isRoot: true,
      },
    });

    if (checkRootAdmin.count !== 0) throw Error("Root Admin already exists");

    // validate email
    if (!validator.isEmail(email)) throw Error("Invalid Email");

    // validate password - password length minimum 6 charachters
    if (password.length < 6) throw Error("Password too short");

    // validate password - password length maximum 20 charachters
    if (password.length > 20) throw Error("Password too long");

    const salt = bcrypt.genSaltSync(12);
    const hash = await bcrypt.hash(password, salt);

    const rootAdminRole = await Role.findOne({
      where: {
        name: "rootAdmin",
      },
    });

    const rootAdmin = await Admin.create({
      name,
      email,
      password: hash,
      isRoot: true,
      roleId: rootAdminRole.roleId,
    });

    res.status(200).json("Root Admin created successfully");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const adminSignIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    // validate email
    if (!validator.isEmail(email)) throw Error("Invalid Email");

    // check if admin exists
    const admin = await Admin.findOne({
      where: { email },
    });

    if (!admin) throw Error("Admin does not exist");

    // compare passwords
    const match = await bcrypt.compare(password, admin.password);

    if (!match) throw Error("Incorrect Password");

    // extract permissions
    const allPermissions = await Permission.findAll({
      include: {
        model: Role,
        required: true,
        attributes: [],
        through: {
          attributes: [],
          where: {
            roleId: admin.roleId,
          },
        },
      },
    });

    const adminPermissions = allPermissions.map((ap) => ap.name);

    const accessToken = jwt.sign(
      { adminId: admin.adminId, roleId: admin.roleId },
      process.env.SECRET_KEY,
      { expiresIn: "5m" }
    );
    const refreshToken = jwt.sign(
      { adminId: admin.adminId, roleId: admin.roleId },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      name: admin.name,
      email: admin.email,
      isRoot: true,
      permissions: adminPermissions,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const fetchAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    return res.status(200).json({
      message: "all admins fetched successfully",
      data: admins,
      length: admins.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const fetchAdminDetails = async (req, res) => {
  try {
    const { adminId } = req.query;
    if (!adminId) throw Error("AdminId not provided");

    const admin = await Admin.findOne({
      where: { adminId },
      include: {
        model: Role,
      },
    });

    if (!admin) throw Error("Admin does not exist");
    res.status(200).json({
      adminId: admin.adminId,
      email: admin.email,
      roleId: admin?.roleId ? admin.roleId : null,
      roleName: admin.role?.name ? admin.role.name : "NO ROLE",
      createdAt: admin.createdAt,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addNewAdmin = async (req, res) => {
  const { name, email, roleId } = req.body;
  try {
    // validate email
    if (!validator.isEmail(email)) throw Error("Invalid Email");

    if (!roleId) throw Error("RoleId not provided");

    // generate and hash a random password
    const password = getRandomString(8);
    const salt = bcrypt.genSaltSync(12);
    const hash = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      password: hash,
      roleId: roleId,
    });

    // send back the email and password
    res.status(200).json({
      email: admin.email,
      password,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const editAdmin = async (req, res) => {
  const { adminId } = req.query;
  const { name, roleId } = req.body;
  try {
    // fetch admin
    const admin = await Admin.findOne({
      where: {
        adminId,
      },
    });

    // check if admin exists
    if (!admin) throw Error("Admin does not exist");

    // check if admin is root
    if (admin.isRoot === true) throw Error("Root Admin cannot be edited");

    if (!name) throw Error("Name is required");

    admin.name = name;
    admin.roleId = roleId;

    // extract permissions
    const allPermission = await Permission.findAll({
      attributes: ["name"],
      include: {
        model: Role,
        attributes: [],
        required: true,
        through: {
          attributes: [],
          where: {
            roleId: admin.roleId,
          },
        },
      },
    });

    const adminPermissions = allPermission.map((ap) => ap.name);

    await admin.save();

    res.status(200).json({
      name: admin.name,
      email: admin.email,
      isRoot: admin.isRoot,
      permissions: adminPermissions,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const resetPasswordForAdmin = async (req, res) => {
  try {
    const { adminId } = req.query;

    if (!adminId) throw Error("AdminId not provided");

    const admin = await Admin.findOne({ where: { adminId } });

    if (!admin) throw Error("Admin does not exist");
    if (admin.isRoot) throw Error("Root Admin password cannot be reset");

    // generate and hash a random password
    const password = getRandomString(8);
    const salt = bcrypt.genSaltSync(12);
    const hash = await bcrypt.hash(password, salt);

    admin.password = hash;
    admin.save();

    res.status(200).json({
      email: admin.email,
      password: password,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const changePasswordForSelf = async (req, res) => {
  try {
    const { adminId, newPassword } = req.body;

    const admin = await Admin.findOne({ where: { adminId } });

    // generate and hash a random password
    const salt = bcrypt.genSaltSync(12);
    const hash = await bcrypt.hash(newPassword, salt);

    admin.password = hash;
    admin.save();

    res.status(200).json("Password changed successfully");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const fetchAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    return res.status(200).json({
      message: "all roles fetched successfully",
      data: roles,
      length: roles.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const fetchRole = async (req, res) => {
  try {
    const { roleId } = req.query;

    // find role
    const role = await Role.findOne({
      where: {
        roleId,
      },
      include: {
        model: Admin,
        attributes: {
          exclude: ["createdAt", "updatedAt", "password", "roleId"],
        },
      },
    });

    if (!role) throw Error("Role does not exist");

    const rolePermissions = await Permission.findAll({
      include: {
        model: Role,
        required: true,
        attributes: [],
        through: {
          attributes: [],
          where: {
            roleId,
          },
        },
      },
    });

    let response = {
      roleId: role.roleId,
      name: role.name,
      permissions: rolePermissions,
    };

    response["admins"] = [];

    if (role.admins && role.admins.length !== 0) {
      response["admins"] = role.admins;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addNewRole = async (req, res) => {
  const { name, permissions } = req.body;
  try {
    const role = await Role.create({ name });
    if (permissions && permissions.length !== 0) {
      await role.addPermissions(permissions).catch(async (error) => {
        await role.destroy();
        console.log(error);
        throw Error("Role could not be added");
      });
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const editRole = async (req, res) => {
  const { roleId } = req.query;
  const { name, permissions } = req.body;
  try {
    const role = await Role.findOne({ where: { roleId } });
    if (role.name === "rootAdmin") throw Error("Cannot edit root admin detail");
    role.name = name;
    await role.removePermissions(await role.getPermissions());
    if (permissions && permissions.length !== 0) {
      await role.addPermissions(permissions);
    }
    await role.save();
    res.status(200).json(role);
  } catch (error) {
    res.status(200).json({ error: error.message });
  }
};

export const deleteRole = async (req, res) => {
  const { roleId } = req.query;
  try {
    // find role
    const role = await Role.findOne({
      where: {
        roleId,
      },
      include: [Admin],
    });

    // checks: if role exists, role id not root admin, role is not associated to any admin
    if (!role) throw Error("Role does not exist");
    if (role.name === "rootAdmin") throw Error("Root admin can not be deleted");
    if (!role.admins || role.admins.length !== 0)
      throw Error("Role is associated to Admins hence can not be deleted");

    // delete associations from join table
    await role.removePermissions(await role.getPermissions());
    await role.destroy();

    // return roleId
    res.status(200).json({ " deletedRoleId ": role.roleId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const fetchAllPermissions = async (req, res) => {
  try {
    const allPermissions = await Permission.findAll();
    console.log(allPermissions);
    res.status(200).json(allPermissions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  const { adminId } = req.query;
  try {
    if (!adminId) throw Error("AdminId not provided");

    const admin = await Admin.findOne({ where: { adminId } });

    if (!admin) throw Error("Admin does not exist");
    if (admin.isRoot) throw Error("Root admin cannot be deleted");

    await admin.destroy();

        res.status(200).json({"deletedAdmin" : adminId});
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}







