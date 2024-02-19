import express from "express";

import {
    adminSignIn,
    adminAddRootAdmin,
    addNewAdmin,
    editAdmin,
    fetchAllRoles,
    fetchRole,
    addNewRole,
    editRole,
    deleteRole,
    deleteAdmin,
    fetchAllPermissions,
    fetchAllAdmins,
    fetchAdminDetails,
    resetPasswordForAdmin,
    changePasswordForSelf,
    newAccessTokenGenerationAdmin,
} from "../../controllers/admin/admins.js";


import requireAdminAuth from "../../middlewares/requireAdminAuth.js";

import {
    requireAdminPermission,
} from "../../middlewares/adminPermissions.js";

const router = express.Router();

router.post("/add_root_admin", adminAddRootAdmin);
router.post("/signin", adminSignIn);

// manage admin routes
router.get("/admins", requireAdminAuth, requireAdminPermission, fetchAllAdmins);     
router.get("/newaccesstoken", requireAdminAuth, newAccessTokenGenerationAdmin);     
router.get("/admin", requireAdminAuth, requireAdminPermission, fetchAdminDetails);    
router.post("/new", requireAdminAuth, requireAdminPermission, addNewAdmin);
router.patch("/edit", requireAdminAuth, requireAdminPermission, editAdmin);  
router.patch("/password/reset", requireAdminAuth, requireAdminPermission, resetPasswordForAdmin);  
router.patch("/password/self", requireAdminAuth, changePasswordForSelf);
router.delete("/delete", requireAdminAuth, requireAdminPermission, deleteAdmin);   

// manage roles routes
router.get("/roles", requireAdminAuth, requireAdminPermission, fetchAllRoles);  
router.get("/roles/role", requireAdminAuth, requireAdminPermission, fetchRole); 
router.post("/role/new", requireAdminAuth, requireAdminPermission, addNewRole);    
router.patch("/role/edit", requireAdminAuth, requireAdminPermission, editRole);   
router.delete("/role/delete", requireAdminAuth, requireAdminPermission, deleteRole);   

// view all permissions
router.get("/permissions", requireAdminAuth, requireAdminPermission,  fetchAllPermissions); 

export default router;
