const express = require("express");
const mongoose = require("mongoose");


//password:jwyTvwGxaT0Ig6r9
const app = express();
const cors = require("cors");

const UserRouter =require("./Routes/UserRoutes");
const QuizRoutes =require("./Routes/QuizRoutes");
const ModuleRouter = require("./Routes/ModuleRoutes");
const societyRoutes = require("./Routes/SocietyRoutes");
const studentQuizeRoutes = require("./Routes/StudentQuizRoutes");

// Middleware
app.use(express.json());
app.use(cors());

app.use("/Users",UserRouter);
app.use("/quiz",QuizRoutes);
app.use("/modules",ModuleRouter);
app.use("/api/modules", ModuleRouter);
app.use("/societies",societyRoutes);
app.use("/student-quiz", studentQuizeRoutes);

// Routes


app.get("/", (req, res) => {
    res.send("It Is Working");
});

// MongoDB connection
mongoose
    .connect(
        "mongodb+srv://unimate1:jwyTvwGxaT0Ig6r9@cluster0.uzozmrm.mongodb.net/"
    )
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(5001, () => {
            console.log("Server running on port 5001");
        });
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });
