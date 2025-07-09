import './App.css'
import School from './school/School.jsx'
import AttendanceList from './school/components/attendance/AttendanceList.jsx'
import Dashboard from './school/components/dashboard/Dashboard.jsx';
import Class from './school/components/class/Class.jsx';
import Schedule from './school/components/schedule/Schedule.jsx';
import Students from './school/components/students/Students.jsx';
import Teachers from './school/components/teachers/Teachers.jsx';
import Notice from './school/components/notice/Notice.jsx';
import Examinations from './school/components/examinations/Examinations.jsx';
import Subjects from './school/components/subjects/Subjects.jsx';
import Client from './client/Client.jsx'
import Home from './client/components/home/Home.jsx'
import Login from './client/components/login/Login.jsx'
import Register from './client/components/register/Register.jsx'
import Teacher from './teacher/Teacher.jsx'
import AttendanceTeacher from './teacher/components/attendance/AttendanceTeacher.jsx';
import ScheduleTeacher from './teacher/components/schedule/ScheduleTeacher.jsx';
import TeacherDetails from './teacher/components/teacher_details/TeacherDetails.jsx';
import ExaminationsTeacher from './teacher/components/examinations/ExaminationsTeacher.jsx';
import NoticeTeacher from './teacher/components/notice/NoticeTeacher.jsx';
import Student from './student/Student.jsx'
import AttendanceStudent from './student/components/attendance/AttendanceStudent.jsx';
import ScheduleStudent from './student/components/schedule/ScheduleStudent.jsx';
import StudentDetails from './student/components/student_details/StudentDetails.jsx';
import ExaminationsStudent from './student/components/examinations/ExaminationsStudent.jsx';
import NoticeStudent from './student/components/notice/NoticeStudent.jsx';

import {BrowserRouter, Route, Routes} from 'react-router-dom'
import ProtectedRoute from './guard/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* school component */}
          <Route path='school' element={<ProtectedRoute allowedRoles={['SCHOOL']}><School/></ProtectedRoute>}>
            <Route index element={<Dashboard/>}/>
            <Route path='dashboard' element={<Dashboard/>}/>
            <Route path='attendance' element={<AttendanceList/>}/>
            <Route path='class' element={<Class/>}/>
            <Route path='teachers' element={<Teachers/>}/>
            <Route path='examinations' element={<Examinations/>}/>
            <Route path='subjects' element={<Subjects/>}/>
            <Route path='students' element={<Students/>}/>
            <Route path='schedule' element={<Schedule/>}/>
            <Route path='notice' element={<Notice/>}/>
          </Route>


          {/* student component */}
          <Route path='student' element={<ProtectedRoute allowedRoles={['STUDENT']}><Student/></ProtectedRoute>}>
            <Route index element={<StudentDetails/>}/>
            <Route path='attendance' element={<AttendanceStudent/>}/>
            <Route path='schedule' element={<ScheduleStudent/>}/>
            <Route path='examinations' element={<ExaminationsStudent/>}/>
            <Route path='notice' element={<NoticeStudent/>}/>
          </Route>


          {/* teacher component */}
          <Route path='teacher' element={<ProtectedRoute allowedRoles={['TEACHER']}><Teacher/></ProtectedRoute>}>
            <Route index element={<TeacherDetails/>}/>
            <Route path='attendance' element={<AttendanceTeacher/>}/>
            <Route path='schedule' element={<ScheduleTeacher/>}/>
            <Route path='examinations' element={<ExaminationsTeacher/>}/>
            <Route path='notice' element={<NoticeTeacher/>}/>
          </Route>


          {/* Client */}
          <Route path='' element={<Client/>}>
            <Route index element={<Home/>}/>
            <Route path='login' element={<Login/>}/>
            <Route path='register' element={<Register/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
