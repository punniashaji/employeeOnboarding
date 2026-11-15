const multer=require("multer");
const path=require("path");
const fs=require("fs");
const crypto=require("crypto");

const imageTypes=["image/jpeg","image/png"];
const imageExt=[".jpg",".jpeg",".png"];

const resumeTypes=["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const resumeExt=[".pdf",".doc",".docx"];

const certificateTypes=["application/pdf","image/jpeg","image/png"];
const certificateExt=[".pdf",".jpg",".jpeg",".png"];

const uploadDir=path.join(__dirname,"..","uploads");
fs.mkdirSync(uploadDir,{recursive:true});

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,uploadDir)
    },
    filename:(req,file,cb)=>{
        //random name so user cannot control the file name on server
        const ext=path.extname(file.originalname).toLowerCase();
        cb(null,Date.now()+"-"+crypto.randomBytes(8).toString("hex")+ext)
    }
})

const fileFilter=(req,file,cb)=>{
    const ext=path.extname(file.originalname).toLowerCase();
    let allowed=false;

    if(file.fieldname==="photo")
    {
        allowed=imageTypes.includes(file.mimetype) && imageExt.includes(ext);
    }
    else if(file.fieldname==="resume")
    {
        allowed=resumeTypes.includes(file.mimetype) && resumeExt.includes(ext);
    }
    else if(file.fieldname.startsWith("certificate"))
    {
        allowed=certificateTypes.includes(file.mimetype) && certificateExt.includes(ext);
    }

    if(!allowed)
    {
        const err=new Error("invalid file type for "+file.fieldname);
        err.name="MulterError";
        return cb(err);
    }
    cb(null,true);
}

//photo, resume and one certificate for each experience (max 10)
const fields=[{name:"photo",maxCount:1},{name:"resume",maxCount:1}];
for(let i=0;i<10;i++)
{
    fields.push({name:"certificate"+i,maxCount:1});
}

const upload=multer({
    storage:storage,
    fileFilter:fileFilter,
    limits:{fileSize:5*1024*1024,files:12}
});

const uploadFiles=upload.fields(fields);

module.exports=uploadFiles;
