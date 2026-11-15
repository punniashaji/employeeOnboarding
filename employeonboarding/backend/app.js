require("dotenv").config();
const express=require("express")
const cors=require("cors");
const helmet=require("helmet");
const { connectdb }=require("./config/dbConnection");
const errorHandler=require("./middleware/errorHandler");
const app=express();
const port=process.env.PORT || 5001;

connectdb();

app.use(helmet());
app.use(cors({origin:process.env.CLIENT_URL}));
app.use(express.json())

app.use("/api/users",require("./routes/userRoutes"))
app.use("/api/employees",require("./routes/employeeRoutes"))
app.use("/api/files",require("./routes/fileRoutes"))

app.use(errorHandler);

app.listen(port,()=>{
    console.log("server running at port",port);
})
