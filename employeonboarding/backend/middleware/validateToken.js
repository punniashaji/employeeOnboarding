const jwt=require("jsonwebtoken");
const { prisma }=require("../config/dbConnection");

const validateToken=async (req,res,next)=>{
    const authHeader=req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer "))
    {
        res.status(401);
        throw new Error("user is not authorized");
    }

    const token=authHeader.split(" ")[1];
    let decoded;
    try {
        decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    }
    catch (error) {
        res.status(401);
        throw new Error("token is invalid or expired");
    }

    //check user still exists and is approved
    const user=await prisma.user.findUnique({where:{id:decoded.id}});
    if(!user || !user.isApproved)
    {
        res.status(401);
        throw new Error("user is not authorized");
    }

    req.user={id:user.id,name:user.name,email:user.email,role:user.role};
    next();
}

module.exports=validateToken;
