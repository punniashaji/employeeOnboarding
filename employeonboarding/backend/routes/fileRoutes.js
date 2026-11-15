const express=require("express");
const router=express.Router();
const validateToken=require("../middleware/validateToken");
const {getFile}=require("../controllers/fileController");

router.get("/:id",validateToken,getFile);

module.exports=router;
