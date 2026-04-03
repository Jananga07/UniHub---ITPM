const express = require("express");
const router = express.Router();
const StudentSupport = require("../Controllers/StudentSupportController");

router.get("/", StudentSupport.getAllLecturers);
router.get("/top", StudentSupport.getTopConsultants);
router.get("/:id", StudentSupport.getLecturerById);
router.post("/", StudentSupport.addLecturer);
router.put("/:id/availability", StudentSupport.updateAvailability);
router.post("/:id/rate", StudentSupport.rateLecturer);
router.delete("/:id", StudentSupport.deleteLecturer);

module.exports = router;
