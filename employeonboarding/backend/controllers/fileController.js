const path=require("path");
const { prisma }=require("../config/dbConnection");

//send file only to logged in users
const getFile=async (req,res)=>{
    const id=Number(req.params.id);
    if(!Number.isInteger(id))
    {
        res.status(400);
        throw new Error("invalid file id");
    }

    const document=await prisma.document.findUnique({where:{id:id}});
    if(!document)
    {
        res.status(404);
        throw new Error("file not found");
    }

    const filePath=path.join(__dirname,"..","uploads",document.storedName);
    res.download(filePath,document.originalName,{headers:{"Content-Type":document.mimeType}});
}

module.exports={getFile};
