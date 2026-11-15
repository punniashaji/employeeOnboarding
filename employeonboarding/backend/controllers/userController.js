const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const { prisma }=require("../config/dbConnection");

const emailRegex=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//register new user, admin has to approve before login
const registerUser=async (req,res)=>{
    const body=req.body || {};
    const name=String(body.name || "").trim();
    const email=String(body.email || "").trim().toLowerCase();
    const password=String(body.password || "");

    if(!name || !email || !password)
    {
        res.status(400);
        throw new Error("all fields are required");
    }
    if(name.length>50)
    {
        res.status(400);
        throw new Error("name should be less than 50 characters");
    }
    if(!emailRegex.test(email) || email.length>100)
    {
        res.status(400);
        throw new Error("email is not valid");
    }
    if(password.length<8 || password.length>50)
    {
        res.status(400);
        throw new Error("password should be 8 to 50 characters");
    }

    const userExists=await prisma.user.findUnique({where:{email:email}});
    if(userExists)
    {
        res.status(400);
        throw new Error("user already registered");
    }

    const hashedPassword=await bcrypt.hash(password,10);
    const user=await prisma.user.create({
        data:{
            name:name,
            email:email,
            password:hashedPassword
        }
    })
    res.status(201).json({id:user.id,name:user.name,email:user.email,message:"registered successfully, wait for admin approval"});
}

const loginUser=async (req,res)=>{
    const body=req.body || {};
    const email=String(body.email || "").trim().toLowerCase();
    const password=String(body.password || "");

    if(!email || !password)
    {
        res.status(400);
        throw new Error("email and password are required");
    }

    const user=await prisma.user.findUnique({where:{email:email}});
    if(!user || !(await bcrypt.compare(password,user.password)))
    {
        res.status(401);
        throw new Error("invalid email or password");
    }
    if(!user.isApproved)
    {
        res.status(403);
        throw new Error("your account is waiting for admin approval");
    }

    const accessToken=jwt.sign(
        {id:user.id},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:"1d"}
    )
    res.status(200).json({
        accessToken:accessToken,
        user:{id:user.id,name:user.name,email:user.email,role:user.role}
    })
}

const currentUser=async (req,res)=>{
    res.status(200).json(req.user);
}

//admin only
const getUsers=async (req,res)=>{
    const users=await prisma.user.findMany({
        select:{id:true,name:true,email:true,role:true,isApproved:true,createdAt:true},
        orderBy:{createdAt:"desc"}
    })
    res.status(200).json(users);
}

const findUser=async (req,res)=>{
    const id=Number(req.params.id);
    if(!Number.isInteger(id))
    {
        res.status(400);
        throw new Error("invalid user id");
    }
    const user=await prisma.user.findUnique({where:{id:id}});
    if(!user)
    {
        res.status(404);
        throw new Error("user not found");
    }
    return user;
}

const approveUser=async (req,res)=>{
    const user=await findUser(req,res);
    await prisma.user.update({where:{id:user.id},data:{isApproved:true}});
    res.status(200).json({message:"user approved"});
}

const changeRole=async (req,res)=>{
    const user=await findUser(req,res);
    const role=(req.body || {}).role;

    if(role!=="admin" && role!=="user")
    {
        res.status(400);
        throw new Error("role should be admin or user");
    }
    if(user.id===req.user.id)
    {
        res.status(400);
        throw new Error("you cannot change your own role");
    }

    await prisma.user.update({where:{id:user.id},data:{role:role}});
    res.status(200).json({message:"role updated"});
}

const deleteUser=async (req,res)=>{
    const user=await findUser(req,res);
    if(user.id===req.user.id)
    {
        res.status(400);
        throw new Error("you cannot delete yourself");
    }
    await prisma.user.delete({where:{id:user.id}});
    res.status(200).json({message:"user deleted"});
}

module.exports={registerUser,loginUser,currentUser,getUsers,approveUser,changeRole,deleteUser};
