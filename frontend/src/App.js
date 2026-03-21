import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Home from './Components/Home/Home';
import UserRegister from './Components/UserRegister/UserRegister';
import Login from './Components/Login/Login';
import StudentProfile from './Components/Student/StudentProfile';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import AddQuiz from './Components/Quiz/AddQuiz';
import StudentQuiz from './Components/Quiz/StudentQuiz';
import ModulePage from './Components/ModulePage/ModulePage';
import SocietyPage from './Components/Society/SocietyPage';
import ModuleDetailsPage from './Components/ModulePage/ModuleDetailsPage';
import StudentSupport from './Components/StudentSupport/StudentSupport';
import ConsultantBooking from './Components/ConsultantBooking/ConsultantBooking';

import SocietyManagerProfile from './Components/Society/SocietyManagerProfile';

import ConsultantTime from './Components/ConsultantTime/ConsultantTime';
import consultantTime from './Components/ConsultantTime/ConsultantTime';
import ConsultantRating from './Components/ConsultantRating/ConsultantRating';
import ComplaintForm from './Components/ComplaintForm/ComplaintForm';
import MyComplaints from './Components/MyComplaints/MyComplaints';
import ComplaintHandling from './Components/ComplaintHandling/ComplaintHandling';



// Resources pages
import FacultyPage         from './Components/Resources/FacultyPage';
import YearPage            from './Components/Resources/YearPage';
import SemesterPage        from './Components/Resources/SemesterPage';
import ResourceModulePage  from './Components/Resources/ResourceModulePage';
import CategoryPage        from './Components/Resources/CategoryPage';
import PdfListPage         from './Components/Resources/PdfListPage';

function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/mainhome"      element={<Home />} />
          <Route path="/userRegister"  element={<UserRegister />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/studentprofile/:id" element={<StudentProfile />} />
          <Route path="/societymanagerprofile/:id" element={<SocietyManagerProfile />} />
          {/* Compatibility route (case-sensitive match in some setups) */}
          <Route path="/SocietyManagerProfile/:id" element={<SocietyManagerProfile />} />
          <Route path="/admin"         element={<AdminDashboard />} />
          <Route path="/adquiz"        element={<AddQuiz />} />
          <Route path="/student-quiz/:moduleId" element={<StudentQuiz />} />
          <Route path="/modulepage"    element={<ModulePage />} />
          <Route path="/societypage"   element={<SocietyPage />} />
          <Route path="/modules/:id"   element={<ModuleDetailsPage />} />
          <Route path="/studentsupport" element={<StudentSupport />} />
          <Route path="/consultant-booking/:consultantId" element={<ConsultantBooking />} />
          <Route path="/consultant-time/:consultantId/:date" element={<ConsultantTime />} />
          <Route path="/consultant-rating/:consultantId" element={<ConsultantRating />} />
          <Route path="/complaint-form" element={<ComplaintForm />} />
          <Route path="/my-complaints" element={<MyComplaints />} />
          <Route path="/complaint-handling" element={<ComplaintHandling />} />    

          <Route path="/modulepage" element={<ModulePage/>}/>
          <Route path="/societypage" element={<SocietyPage/>}/>
          <Route path="/modules/:id" element={<ModuleDetailsPage />} />
          <Route path="/studentsupport" element={<StudentSupport/>} />
          <Route path="/consultant-booking/:consultantId" element={<ConsultantBooking />} />
          <Route path="/consultant-time/:consultantId/:date" element={<ConsultantTime />} />
          



          {/* ── Resources ───────────────────────────────────────────── */}
          <Route path="/resources"                                                   element={<FacultyPage />} />
          <Route path="/resources/:facultyId/years"                                  element={<YearPage />} />
          <Route path="/resources/:facultyId/year/:year/semesters"                  element={<SemesterPage />} />
          <Route path="/resources/:facultyId/year/:year/semester/:semester/modules" element={<ResourceModulePage />} />
          <Route path="/resources/modules/:moduleId"                                element={<CategoryPage />} />
          <Route path="/resources/modules/:moduleId/category/:category"             element={<PdfListPage />} />
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
