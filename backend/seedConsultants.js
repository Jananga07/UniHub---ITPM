const mongoose = require("mongoose");
const StudentSupport = require("./Models/StudentSupportModel");

const DB_URI = "mongodb+srv://unimate1:jwyTvwGxaT0Ig6r9@cluster0.uzozmrm.mongodb.net/";

const seed = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to DB.");
    
    // Clear existing
    await StudentSupport.deleteMany({});
    console.log("Cleared old consultants.");

    const newConsultants = [
      {
        name: "Dr. Aruna Bandara",
        title: "Consultation",
        faculty: "FACULTY OF COMPUTING",
        expertise: "PhD in Computer Science Specialist in Algorithms and Data Structures",
        room: "Room CS-201",
        email: "aruna.bandara@university.edu",
        averageRating: 0,
        totalStars: 0,
        numberOfReviews: 0,
        available: true
      },
      {
        name: "Prof. Nimal Fernando",
        title: "Senior Consultant",
        faculty: "FACULTY OF ENGINEERING",
        expertise: "PhD in Software Engineering Specialist in Machine Learning and AI",
        room: "Room EN-305",
        email: "nimal.fernando@university.edu",
        averageRating: 0,
        totalStars: 0,
        numberOfReviews: 0,
        available: true
      },
      {
        name: "Dr. Kanishka Senanayake",
        title: "Consultation",
        faculty: "FACULTY OF BUSINESS",
        expertise: "PhD in Business Administration Specialist in Marketing and Management",
        room: "Room BU-102",
        email: "kanishka.senanayake@university.edu",
        averageRating: 0,
        totalStars: 0,
        numberOfReviews: 0,
        available: true
      },
      {
        name: "Prof. Kamal Rajapaksa",
        title: "Senior Consultant",
        faculty: "FACULTY OF COMPUTING",
        expertise: "PhD in Data Science Specialist in Big Data Analytics",
        room: "Room CS-401",
        email: "kamal.rajapaksa@university.edu",
        averageRating: 0,
        totalStars: 0,
        numberOfReviews: 0,
        available: true
      },
      {
        name: "Dr. Saman Kumara",
        title: "Assistant Consultant",
        faculty: "FACULTY OF ENGINEERING",
        expertise: "MSc in Civil Engineering Specialist in Structural Dynamics",
        room: "Room EN-104",
        email: "saman.kumara@university.edu",
        averageRating: 0,
        totalStars: 0,
        numberOfReviews: 0,
        available: true
      },
      {
        name: "Prof. Anura Dissanayake",
        title: "Senior Consultant",
        faculty: "FACULTY OF COMPUTING",
        expertise: "PhD in Information Systems Specialist in Cloud Computing",
        room: "Room CS-305",
        email: "anura.dissanayake@university.edu",
        averageRating: 0,
        totalStars: 0,
        numberOfReviews: 0,
        available: true
      }
    ];

    await StudentSupport.insertMany(newConsultants);
    console.log("Seeded new consultants successfully!");
    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
