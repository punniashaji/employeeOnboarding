const express=require("express");
const router=express.Router();
const rateLimit=require("express-rate-limit");
const validateToken=require("../middleware/validateToken");
const checkAdmin=require("../middleware/checkAdmin");
const {registerUser,loginUser,currentUser,getUsers,approveUser,changeRole,deleteUser}=require("../controllers/userController");

//max 10 tries in 15 minutes for login and register
const limiter=rateLimit({
    windowMs:15*60*1000,
    limit:10,
    message:{message:"too many attempts, try again after 15 minutes"}
})

router.post("/register",limiter,registerUser);
router.post("/login",limiter,loginUser);
router.get("/current",validateToken,currentUser);

router.route("/").get(validateToken,checkAdmin,getUsers);
router.route("/:id").delete(validateToken,checkAdmin,deleteUser);
router.put("/:id/approve",validateToken,checkAdmin,approveUser);
router.put("/:id/role",validateToken,checkAdmin,changeRole);

module.exports=router;
