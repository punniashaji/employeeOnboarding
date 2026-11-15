const checkAdmin=(req,res,next)=>{
    if(req.user.role!=="admin")
    {
        res.status(403);
        throw new Error("only admin can do this");
    }
    next();
}

module.exports=checkAdmin;
