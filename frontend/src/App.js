import React from 'react';
import { Route,Routes } from 'react-router-dom';


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

function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/mainhome" element={<Home/>}/>
          <Route path="/userRegister" element={<UserRegister/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/studentprofile/:id" element={<StudentProfile />} />
          <Route path="/admin" element={<AdminDashboard/>}/>
          <Route path="/adquiz" element={<AddQuiz/>}/>
          <Route path="/student-quiz/:moduleId" element={<StudentQuiz />} />
          <Route path="/modulepage" element={<ModulePage/>}/>
          <Route path="/societypage" element={<SocietyPage/>}/>
          <Route path="/modules/:id" element={<ModuleDetailsPage />} />



        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
