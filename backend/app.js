const express = require("express");
const path = require("node:path");
const mongoose = require("mongoose");


//password:jwyTvwGxaT0Ig6r9
const app = express();
const cors = require("cors");

const UserRouter =require("./Routes/UserRoutes");
const QuizRoutes =require("./Routes/QuizRoutes");
const ModuleRouter = require("./Routes/ModuleRoutes");
const societyRoutes = require("./Routes/SocietyRoutes");
const studentQuizeRoutes = require("./Routes/StudentQuizRoutes");
const StudentSupportRoutes = require("./Routes/StudentSupportRoutes");
const ResourceRoutes = require("./Routes/ResourceRoutes");
const complaintRoutes = require("./Routes/complaintRoutes");
const consultantBookingRoutes = require("./Routes/consultantBookingRoutes");
const consultantRatingRoutes = require("./Routes/consultantRatingRoutes");
const membershipRoutes = require("./Routes/membershipRoutes");

// Middleware
app.use(express.json());
app.use(cors());
// Serve uploaded PDFs as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/Users", UserRouter);
// Lowercase alias so frontend can POST /users/login and /users
app.use("/users", UserRouter);
app.use("/quiz",QuizRoutes);
app.use("/modules",ModuleRouter);
app.use("/api/modules", ModuleRouter);
app.use("/societies",societyRoutes);
app.use("/student-quiz", studentQuizeRoutes);
app.use("/studentsupport", StudentSupportRoutes);
app.use("/resources", ResourceRoutes);
app.use("/complaints", complaintRoutes);
app.use("/consultant-bookings", consultantBookingRoutes);
app.use("/consultant-ratings", consultantRatingRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/consultant-bookings", consultantBookingRoutes);
app.use("/api/consultant-ratings", consultantRatingRoutes);
app.use("/api/memberships", membershipRoutes);
// Routes


app.get("/", (req, res) => {
    res.send("It Is Working");
});

const startServer = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://unimate1:jwyTvwGxaT0Ig6r9@cluster0.uzozmrm.mongodb.net/"
        );

        console.log("Connected to MongoDB");
        app.listen(5001, () => {
            console.log("Server running on port 5001");
        });
    } catch (err) {
        console.log("MongoDB connection error:", err);
    }
};

startServer();
