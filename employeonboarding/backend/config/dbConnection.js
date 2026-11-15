const { PrismaClient }=require("@prisma/client");

const prisma=new PrismaClient();

const connectdb=async ()=>{
    try {
        await prisma.$connect();
        console.log("Database connected");
    }
    catch (error) {
        console.log("database connection failed");
        console.log(error.message);
    }
}

module.exports={prisma,connectdb};
