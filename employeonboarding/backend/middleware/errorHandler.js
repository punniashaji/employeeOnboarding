const fs=require("fs");

const errorHandler=(err,req,res,next)=>{

    //if request failed, delete the files uploaded in this request
    if(req.files)
    {
        for(const key in req.files)
        {
            req.files[key].forEach((file)=>{
                fs.unlink(file.path,()=>{});
            })
        }
    }

    let statusCode=res.statusCode!==200 ? res.statusCode : 500;
    let message=err.message;

    if(err.name==="MulterError")
    {
        statusCode=400;
        if(err.code==="LIMIT_FILE_SIZE")
        {
            message="file size should not be more than 5MB";
        }
    }
    else if(err.status===400)
    {
        statusCode=400;
        message="invalid request data";
    }

    if(statusCode===500 && process.env.NODE_ENV==="production")
    {
        message="something went wrong";
    }

    res.status(statusCode).json({
        statusCode:statusCode,
        message:message,
        stackTrace:process.env.NODE_ENV==="production" ? null : err.stack
    })
}

module.exports=errorHandler;
