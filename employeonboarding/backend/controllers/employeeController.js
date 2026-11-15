const fs=require("fs");
const path=require("path");
const { prisma }=require("../config/dbConnection");
const departments=require("../config/departments");

const emailRegex=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const dateRegex=/^\d{4}-\d{2}-\d{2}$/;

const isValidDate=(value)=>{
    return dateRegex.test(value) && !isNaN(new Date(value).getTime());
}

const getFile=(req,name)=>{
    if(req.files && req.files[name])
    {
        return req.files[name][0];
    }
    return null;
}

const deleteFile=(storedName)=>{
    fs.unlink(path.join(__dirname,"..","uploads",storedName),()=>{});
}

const makeDocument=(file,type,employeeId,experienceId)=>{
    return {
        type:type,
        originalName:file.originalname.slice(0,255),
        storedName:file.filename,
        mimeType:file.mimetype,
        size:file.size,
        employeeId:employeeId,
        experienceId:experienceId
    }
}

const getId=(req,res)=>{
    const id=Number(req.params.id);
    if(!Number.isInteger(id))
    {
        res.status(400);
        throw new Error("invalid employee id");
    }
    return id;
}

//check all the fields sent from form
const validateEmployee=(req,res)=>{
    const body=req.body || {};

    const sendError=(message)=>{
        res.status(400);
        throw new Error(message);
    }

    const data={
        name:String(body.name || "").trim(),
        email:String(body.email || "").trim().toLowerCase(),
        mobile:String(body.mobile || "").trim(),
        dob:String(body.dob || "").trim(),
        department:String(body.department || "").trim(),
        designation:String(body.designation || "").trim(),
        joiningDate:String(body.joiningDate || "").trim(),
        address:String(body.address || "").trim()
    }

    if(!data.name || !data.email || !data.mobile || !data.dob || !data.department || !data.designation || !data.joiningDate || !data.address)
    {
        sendError("all fields are required");
    }
    if(!/^[a-zA-Z .]+$/.test(data.name) || data.name.length>50)
    {
        sendError("name should contain only letters and be less than 50 characters");
    }
    if(!emailRegex.test(data.email) || data.email.length>100)
    {
        sendError("email is not valid");
    }
    if(!/^[6-9][0-9]{9}$/.test(data.mobile))
    {
        sendError("mobile number should be 10 digits and start with 6, 7, 8 or 9");
    }
    if(!departments.includes(data.department))
    {
        sendError("department is not valid");
    }
    if(data.designation.length>50)
    {
        sendError("designation should be less than 50 characters");
    }
    if(data.address.length>250)
    {
        sendError("address should be less than 250 characters");
    }
    if(!isValidDate(data.dob) || !isValidDate(data.joiningDate))
    {
        sendError("date is not valid");
    }

    const dob=new Date(data.dob);
    const joiningDate=new Date(data.joiningDate);
    if(dob>=new Date())
    {
        sendError("date of birth should be before today");
    }
    if(joiningDate<=dob)
    {
        sendError("joining date should be after date of birth");
    }

    let qualifications;
    let experiences;
    try {
        qualifications=JSON.parse(body.qualifications || "[]");
        experiences=JSON.parse(body.experiences || "[]");
    }
    catch (error) {
        sendError("qualification or experience data is not valid");
    }
    if(!Array.isArray(qualifications) || !Array.isArray(experiences))
    {
        sendError("qualification or experience data is not valid");
    }
    if(qualifications.length>10 || experiences.length>10)
    {
        sendError("maximum 10 qualifications and 10 experiences allowed");
    }

    const currentYear=new Date().getFullYear();
    const qualificationList=[];
    for(const q of qualifications)
    {
        if(!q || typeof q!=="object")
        {
            sendError("qualification data is not valid");
        }
        const item={
            qualification:String(q.qualification || "").trim(),
            university:String(q.university || "").trim(),
            yearOfPassing:Number(q.yearOfPassing),
            score:Number(q.score)
        }
        if(!item.qualification || !item.university || String(q.yearOfPassing || "").trim()==="" || String(q.score ?? "").trim()==="")
        {
            sendError("all qualification fields are required");
        }
        if(item.qualification.length>100 || item.university.length>100)
        {
            sendError("qualification and university should be less than 100 characters");
        }
        if(!Number.isInteger(item.yearOfPassing) || item.yearOfPassing<1950 || item.yearOfPassing>currentYear)
        {
            sendError("year of passing is not valid");
        }
        if(isNaN(item.score) || item.score<0 || item.score>100)
        {
            sendError("percentage / cgpa should be between 0 and 100");
        }
        qualificationList.push(item);
    }

    const experienceList=[];
    for(const e of experiences)
    {
        if(!e || typeof e!=="object")
        {
            sendError("experience data is not valid");
        }
        const item={
            id:e.id ? Number(e.id) : null,
            company:String(e.company || "").trim(),
            designation:String(e.designation || "").trim(),
            fromDate:String(e.fromDate || "").trim(),
            toDate:String(e.toDate || "").trim(),
            removeCertificate:e.removeCertificate===true
        }
        if(item.id!==null && !Number.isInteger(item.id))
        {
            sendError("experience data is not valid");
        }
        if(!item.company || !item.designation || !item.fromDate || !item.toDate)
        {
            sendError("all experience fields are required");
        }
        if(item.company.length>100 || item.designation.length>50)
        {
            sendError("company or designation is too long");
        }
        if(!isValidDate(item.fromDate) || !isValidDate(item.toDate))
        {
            sendError("experience date is not valid");
        }
        item.fromDate=new Date(item.fromDate);
        item.toDate=new Date(item.toDate);
        if(item.toDate<item.fromDate)
        {
            sendError("experience to date should be after from date");
        }
        if(item.fromDate<=dob)
        {
            sendError("experience from date should be after date of birth");
        }
        experienceList.push(item);
    }

    //certificate0 belongs to first experience, certificate1 to second ...
    if(req.files)
    {
        for(const key in req.files)
        {
            if(key.startsWith("certificate"))
            {
                const index=Number(key.replace("certificate",""));
                if(index>=experienceList.length)
                {
                    sendError("certificate uploaded without experience");
                }
            }
        }
    }

    data.dob=dob;
    data.joiningDate=joiningDate;
    return {data:data,qualifications:qualificationList,experiences:experienceList};
}

//list with search, filter, sort and pagination
const getEmployees=async (req,res)=>{
    let page=parseInt(req.query.page) || 1;
    let limit=parseInt(req.query.limit) || 5;
    if(page<1) page=1;
    if(limit<1 || limit>50) limit=5;

    const search=String(req.query.search || "").trim().slice(0,50);
    const department=String(req.query.department || "");
    const sortFields=["name","email","department","designation","joiningDate"];
    const sortBy=sortFields.includes(req.query.sortBy) ? req.query.sortBy : "createdAt";
    const order=req.query.order==="asc" ? "asc" : "desc";

    const where={};
    if(search)
    {
        where.OR=[
            {name:{contains:search}},
            {email:{contains:search}}
        ]
    }
    if(department)
    {
        if(!departments.includes(department))
        {
            res.status(400);
            throw new Error("department is not valid");
        }
        where.department=department;
    }

    const total=await prisma.employee.count({where:where});
    const employees=await prisma.employee.findMany({
        where:where,
        select:{id:true,name:true,email:true,department:true,designation:true,joiningDate:true},
        orderBy:[{[sortBy]:order},{id:"asc"}],
        skip:(page-1)*limit,
        take:limit
    })

    res.status(200).json({
        employees:employees,
        total:total,
        page:page,
        totalPages:Math.ceil(total/limit)
    })
}

//check if email is already used by another employee
const checkEmailExists=async (req,res)=>{
    const email=String(req.query.email || "").trim().toLowerCase();
    const id=Number(req.query.id);

    if(!emailRegex.test(email) || email.length>100)
    {
        res.status(400);
        throw new Error("email is not valid");
    }

    const where={email:email};
    if(Number.isInteger(id))
    {
        where.NOT={id:id};
    }
    const employee=await prisma.employee.findFirst({where:where,select:{id:true}});
    res.status(200).json({exists:!!employee});
}

const getOneEmployee=async (req,res)=>{
    const id=getId(req,res);
    const employee=await prisma.employee.findUnique({
        where:{id:id},
        include:{
            qualifications:true,
            experiences:{orderBy:{fromDate:"asc"}},
            documents:{select:{id:true,type:true,originalName:true,mimeType:true,size:true,experienceId:true}}
        }
    })
    if(!employee)
    {
        res.status(404);
        throw new Error("employee not found");
    }
    res.status(200).json(employee);
}

const createEmployee=async (req,res)=>{
    const {data,qualifications,experiences}=validateEmployee(req,res);

    const resume=getFile(req,"resume");
    const photo=getFile(req,"photo");
    if(!resume)
    {
        res.status(400);
        throw new Error("resume is required");
    }

    const emailExists=await prisma.employee.findUnique({where:{email:data.email}});
    if(emailExists)
    {
        res.status(400);
        throw new Error("employee with this email already exists");
    }

    const employee=await prisma.$transaction(async (tx)=>{
        const newEmployee=await tx.employee.create({
            data:{
                ...data,
                qualifications:{create:qualifications}
            }
        })

        await tx.document.create({data:makeDocument(resume,"resume",newEmployee.id,null)});
        if(photo)
        {
            await tx.document.create({data:makeDocument(photo,"photo",newEmployee.id,null)});
        }

        for(let i=0;i<experiences.length;i++)
        {
            const exp=experiences[i];
            const newExp=await tx.experience.create({
                data:{
                    company:exp.company,
                    designation:exp.designation,
                    fromDate:exp.fromDate,
                    toDate:exp.toDate,
                    employeeId:newEmployee.id
                }
            })
            const certificate=getFile(req,"certificate"+i);
            if(certificate)
            {
                await tx.document.create({data:makeDocument(certificate,"certificate",newEmployee.id,newExp.id)});
            }
        }
        return newEmployee;
    })

    res.status(201).json(employee);
}

const updateEmployee=async (req,res)=>{
    const id=getId(req,res);
    const employee=await prisma.employee.findUnique({
        where:{id:id},
        include:{experiences:true,documents:true}
    })
    if(!employee)
    {
        res.status(404);
        throw new Error("employee not found for updation");
    }

    const {data,qualifications,experiences}=validateEmployee(req,res);

    const emailExists=await prisma.employee.findFirst({where:{email:data.email,NOT:{id:id}}});
    if(emailExists)
    {
        res.status(400);
        throw new Error("employee with this email already exists");
    }

    //experience id should belong to this employee
    for(const exp of experiences)
    {
        if(exp.id && !employee.experiences.find((e)=>e.id===exp.id))
        {
            res.status(400);
            throw new Error("experience not found for this employee");
        }
    }

    const photo=getFile(req,"photo");
    const resume=getFile(req,"resume");
    const removePhoto=req.body.removePhoto==="true";
    const oldPhoto=employee.documents.find((d)=>d.type==="photo");
    const oldResume=employee.documents.find((d)=>d.type==="resume");
    const filesToDelete=[];

    await prisma.$transaction(async (tx)=>{
        await tx.employee.update({where:{id:id},data:data});

        //replace all qualifications with new list
        await tx.qualification.deleteMany({where:{employeeId:id}});
        if(qualifications.length>0)
        {
            await tx.qualification.createMany({
                data:qualifications.map((q)=>({...q,employeeId:id}))
            })
        }

        if(oldPhoto && (photo || removePhoto))
        {
            await tx.document.delete({where:{id:oldPhoto.id}});
            filesToDelete.push(oldPhoto.storedName);
        }
        if(photo)
        {
            await tx.document.create({data:makeDocument(photo,"photo",id,null)});
        }

        if(resume)
        {
            if(oldResume)
            {
                await tx.document.delete({where:{id:oldResume.id}});
                filesToDelete.push(oldResume.storedName);
            }
            await tx.document.create({data:makeDocument(resume,"resume",id,null)});
        }

        //delete experiences that are removed from form
        const keepIds=experiences.filter((e)=>e.id).map((e)=>e.id);
        for(const oldExp of employee.experiences)
        {
            if(!keepIds.includes(oldExp.id))
            {
                const docs=employee.documents.filter((d)=>d.experienceId===oldExp.id);
                for(const doc of docs)
                {
                    await tx.document.delete({where:{id:doc.id}});
                    filesToDelete.push(doc.storedName);
                }
                await tx.experience.delete({where:{id:oldExp.id}});
            }
        }

        for(let i=0;i<experiences.length;i++)
        {
            const exp=experiences[i];
            const expData={
                company:exp.company,
                designation:exp.designation,
                fromDate:exp.fromDate,
                toDate:exp.toDate
            }
            let expId=exp.id;
            if(exp.id)
            {
                await tx.experience.update({where:{id:exp.id},data:expData});
            }
            else
            {
                const newExp=await tx.experience.create({data:{...expData,employeeId:id}});
                expId=newExp.id;
            }

            const certificate=getFile(req,"certificate"+i);
            const oldCertificate=exp.id ? employee.documents.find((d)=>d.experienceId===exp.id) : null;
            if(oldCertificate && (certificate || exp.removeCertificate))
            {
                await tx.document.delete({where:{id:oldCertificate.id}});
                filesToDelete.push(oldCertificate.storedName);
            }
            if(certificate)
            {
                await tx.document.create({data:makeDocument(certificate,"certificate",id,expId)});
            }
        }
    })

    //remove old files only after database is updated
    filesToDelete.forEach((name)=>deleteFile(name));

    res.status(200).json({message:"employee updated"});
}

//admin only
const deleteEmployee=async (req,res)=>{
    const id=getId(req,res);
    const employee=await prisma.employee.findUnique({where:{id:id},include:{documents:true}});
    if(!employee)
    {
        res.status(404);
        throw new Error("employee not found for deletion");
    }

    //documents first, sql server does not allow two cascade paths to document table
    await prisma.$transaction([
        prisma.document.deleteMany({where:{employeeId:id}}),
        prisma.employee.delete({where:{id:id}})
    ])
    employee.documents.forEach((doc)=>deleteFile(doc.storedName));

    res.status(200).json({message:`${employee.name} is deleted`});
}

module.exports={getEmployees,getOneEmployee,createEmployee,updateEmployee,deleteEmployee,checkEmailExists};
