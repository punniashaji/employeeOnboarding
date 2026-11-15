const express=require("express");
const router=express.Router();
const validateToken=require("../middleware/validateToken");
const checkAdmin=require("../middleware/checkAdmin");
const uploadFiles=require("../middleware/multer");
const {getEmployees,getOneEmployee,createEmployee,updateEmployee,deleteEmployee,checkEmailExists}=require("../controllers/employeeController");

//all employee routes need login
router.use(validateToken);

//this should be above /:id
router.get("/check-email",checkEmailExists);

router.route("/").get(getEmployees)
                 .post(uploadFiles,createEmployee)
router.route("/:id").get(getOneEmployee)
                    .put(uploadFiles,updateEmployee)
                    .delete(checkAdmin,deleteEmployee)

module.exports=router;
