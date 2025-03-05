import logo from './logo.svg';
import './App.css';
import Generatequestion from './components/Generatequestion';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AddNewInterview from './components/Addnewinterview';
import CreateInterview from './components/Createinterview';
import InterviewList from './components/Interviewlist';
import ViewQuestions from './components/Viewquestions';
import Ureg from './components/Ureg';
import Mcaapprove from './components/Mcaapprove';
import Mbapprove from './components/Mbaapprove';
import Btechapprove from './components/Btechapprove';
import Usignin from './components/Usignin';
import AddJob from './components/Addjob';
import Joblist from './components/Joblist';
import ViewJobs from './components/Viewjob';
import McajobRegistrations from './components/Mcajobregistrants';
import MbajobRegistrations from './components/Mbajobregistration';
import BtechjobRegistrations from './components/Btechjobregistration';
import Addquestions from './components/Addquestion';
import Weekreview from './components/Weekreview';
import Quizdisplay from './components/Quizdisplay';
import QmcaSubmissions from './components/Qmcasubmissions';
import Aweekslist from './components/Weeklist';
import Qmbasubmssions from './components/Qmbasubmissions';
import Qbtechsubmssions from './components/Qbtechsubmission';
import Codingq from './components/Codinq';
import Cweekss from './components/Cweekss';
import Compiler from './components/Compiler';
import Weekcompilers from './components/Weekcompilers';
import AweekSubmissions from './components/Csubmisiondetails copy';
import McaweekSubmissions from './components/Csubmisiondetails copy';
import MbaweekSubmissions from './components/Mbacsubmissions';
import BtechweekSubmissions from './components/Btechcsubmissions';
import JobPositionsPage from './components/Jobposition';
import Interviewsubmission from './components/mcainterviewsubmission';
import Mbainterviewsubmission from './components/Mbainterviewsubmission';
import Btechinterviewsubmission from './components/Btechinterviewsubmission';
import Dashboard from './components/Dashboard';
import Qusers from './components/Qusers';
import Ucompilers from './components/Ucompilers';
import UserInterviewHistory from './components/Userinterviewhistory';
import AdminLogin from './components/Adminlogin';
import Mcaupdation from './components/Mcaupdation';
import Mbaupdation from './components/Mbaupdation';
import Mbajoblist from './components/Mbajoblist';
import Mbaweekslist from './components/Mbaweeklist';
import Mbaweekcompilers from './components/Mbaweekcompilers';
import MbajobPositionsPage from './components/Mbapositionpage';

function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route path='/createinterview' element={<CreateInterview/>}/>
    <Route path='/i' element={<InterviewList/>}/>
    <Route path="/generate-questions/:interviewId" element={<ViewQuestions />} />
    <Route path='/userinterviews' element={<UserInterviewHistory/>}/>
    <Route path='/jobposition' element={<JobPositionsPage/>}/>
    <Route path='/mbajobposition' element={<MbajobPositionsPage/>}/>
    <Route path='mcasubmissions/:jobPosition' element={<Interviewsubmission/>}/>
    <Route path='mbasubmissions/:jobPosition' element={<Mbainterviewsubmission/>}/>
    <Route path='btechsubmissions/:jobPosition' element={<Btechinterviewsubmission/>}/>




    <Route path="/" element={<Usignin/>} />
    
    <Route path="/admin" element={<AdminLogin/>} />
    <Route path="/dashboard" element={<Dashboard/>} />
    <Route path="/ureg" element={<Ureg />} />
    <Route path="/mcaapprove" element={<Mcaapprove/>} />
    <Route path="/mbaapprove" element={<Mbapprove/>} />
    <Route path="/btechapprove" element={<Btechapprove/>} />
    <Route path="/mcaupdation" element={<Mcaupdation/>} />
    <Route path="/mbaupdation" element={<Mbaupdation/>} />

    <Route path="/addjob" element={<AddJob/>} />
    <Route path="/viewjobs" element={<ViewJobs/>} />
    <Route path="/joblist" element={<Joblist/>} />
    <Route path="/mbajoblist" element={<Mbajoblist/>} />
    <Route path="/jobs/:jobId/mcaregistrations" element={<McajobRegistrations/>} />
    <Route path="/jobs/:jobId/mbaregistrations" element={<MbajobRegistrations/>} />
    <Route path="/jobs/:jobId/btechregistrations" element={<BtechjobRegistrations/>} />

    <Route path="/addquestion" element={<Addquestions/>} />
    <Route path="/weekreview" element={<Weekreview/>} />
    <Route path="/company/:company/week/:week" element={<Quizdisplay/>} />
    <Route path="/qusers" element={<Qusers/>} />

   <Route path="/weeklist" element={<Aweekslist/>} />
   <Route path="/mbaweeklist" element={<Mbaweekslist/>} />
    <Route path="/mcasubmissions/:week" element={<QmcaSubmissions />} />
    <Route path="/mbasubmissions/:week" element={<Qmbasubmssions />} />
    <Route path="/btechsubmissions/:week" element={<Qbtechsubmssions />} />

      
    <Route path="/codingq" element={<Codingq />} />
    <Route path="/cweeks" element={<Cweekss />} />
    <Route path="/compiler/:company/:week" element={<Compiler />} />
    <Route path="/ucompilers" element={<Ucompilers />} />
    <Route path="/submissionweeks" element={<Weekcompilers/>} />
    <Route path="/mbasubmissionweeks" element={<Mbaweekcompilers/>} />
    <Route path="/mcasubmissions/week/:week" element={<McaweekSubmissions/>} />
    <Route path="/mbasubmissions/week/:week" element={<MbaweekSubmissions/>} />
    <Route path="/btechsubmissions/week/:week" element={<BtechweekSubmissions/>} />



      
 
      
    </Routes>
    </BrowserRouter>
  );
}


export default App;
