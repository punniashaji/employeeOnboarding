//run once to create the first admin: npm run create-admin
require("dotenv").config();
const bcrypt=require("bcrypt");
const { prisma }=require("../config/dbConnection");

const createAdmin=async ()=>{
    const name=process.env.ADMIN_NAME || "Admin";
    const email=String(process.env.ADMIN_EMAIL || "").toLowerCase();
    const password=process.env.ADMIN_PASSWORD || "";

    if(!email || password.length<8)
    {
        console.log("set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters) in .env file");
        return;
    }

    const hashedPassword=await bcrypt.hash(password,10);
    const user=await prisma.user.findUnique({where:{email:email}});

    if(user)
    {
        await prisma.user.update({
            where:{email:email},
            data:{role:"admin",isApproved:true,password:hashedPassword}
        })
        console.log("existing user updated as admin");
    }
    else
    {
        await prisma.user.create({
            data:{name:name,email:email,password:hashedPassword,role:"admin",isApproved:true}
        })
        console.log("admin created");
    }
}

createAdmin()
    .catch((error)=>{
        console.log("admin not created");
        console.log(error.message);
    })
    .finally(()=>prisma.$disconnect());
