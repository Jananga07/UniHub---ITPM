const ConsultantBooking = require("../Models/ConsultantBookingModel");

// Get all consultant bookings
const getAllBookings = async (req, res) => {
  try {
    const { status, consultantId } = req.query;
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (consultantId && consultantId !== 'all') {
      filter.consultantId = consultantId;
    }

    const bookings = await ConsultantBooking.find(filter)
      .sort({ bookingDate: -1 });
    
    return res.status(200).json({ bookings });
  } catch (err) {
    console.error("Get bookings error:", err);
    return res.status(500).json({ message: "Error retrieving bookings" });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  try {
    const booking = await ConsultantBooking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ booking });
  } catch (err) {
    console.error("Get booking by ID error:", err);
    return res.status(500).json({ message: "Error fetching booking" });
  }
};

// Create new booking
const createBooking = async (req, res) => {
  const { consultantId, consultantName, consultantFaculty, date, time, studentEmail, studentName } = req.body;

  try {
    const newBooking = new ConsultantBooking({
      consultantId,
      consultantName,
      consultantFaculty,
      date,
      time,
      studentEmail,
      studentName,
      status: 'pending'
    });

    await newBooking.save();
    return res.status(201).json({ newBooking });
  } catch (err) {
    console.error("Create booking error:", err);
    return res.status(500).json({ message: "Error creating booking" });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ message: "Missing booking ID or status" });
  }

  try {
    const updatedBooking = await ConsultantBooking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ updatedBooking });
  } catch (err) {
    console.error("Update booking status error:", err);
    return res.status(500).json({ message: "Error updating booking status" });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Missing booking ID" });
  }

  try {
    const deletedBooking = await ConsultantBooking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Delete booking error:", err);
    return res.status(500).json({ message: "Error deleting booking" });
  }
};

// Get booking statistics
const getBookingStats = async (req, res) => {
  try {
    const stats = await ConsultantBooking.aggregate([
      {
        $group: {
          _id: '$consultantId',
          count: { $sum: 1 },
          confirmed: { 
            $sum: { 
              $cond: { if: { $eq: ['$status', 'confirmed'] }, then: 1, else: 0 } 
            }
          },
          pending: { 
            $sum: { 
              $cond: { if: { $eq: ['$status', 'pending'] }, then: 1, else: 0 } 
            }
          },
          cancelled: { 
            $sum: { 
              $cond: { if: { $eq: ['$status', 'cancelled'] }, then: 1, else: 0 } 
            }
          }
        }
      },
      {
        $group: null,
        total: { $sum: 1 }
      }
    ]);

    return res.status(200).json({ stats });
  } catch (err) {
    console.error("Get booking stats error:", err);
    return res.status(500).json({ message: "Error retrieving booking statistics" });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingStats
};
