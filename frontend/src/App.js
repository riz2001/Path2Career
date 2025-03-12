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
import BtechUpdation from './components/Btechupdation';
import UpdateQuestions from './components/Updatequestions';
import Aanswer from './components/Aanswer';
import Aanswerview from './components/Aanswerview';
import AscoreTable from './components/Ascoretable';
import Codingupdate from './components/Codinqupdate';
import Passedtestcass from './components/Passedtestcass';
import Passeddisplay from './components/Passeddisplay';
import Fourweek from './components/Fourweek';
import AddAnswers from './components/Addanswers';
import Deletej from './components/Deletej';
import ProfilePage from './components/Profilepage';
import Addoffcampus from './components/Addoffcampus';
import Soffcampus from './components/Soffcampus';
import Prediction from './components/Prediction';
import McascoreTable from './components/Mcascoretable';
import Mcafourweek from './components/Mcafourweeks';
import Btechjoblist from './components/Btechjoblist';
import Btechweekslist from './components/Btechweeklist';
import BtechscoreTable from './components/Btechscoretable';
import Btechweekcompilers from './components/Btechweekcompilers';
import Btechfourweek from './components/Btechfourweek';
import BtechjobPositionsPage from './components/Btechjobpositionpage';
import Deletecode from './components/Deletecode';
import Deletequiz from './components/Deletequiz';

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
    <Route path='/btechjobposition' element={<BtechjobPositionsPage/>}/>
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
    <Route path="/btechupdation" element={<BtechUpdation/>} />
    <Route path="/profilepage" element={<ProfilePage/>} />

    <Route path="/addjob" element={<AddJob/>} />
    <Route path="/viewjobs" element={<ViewJobs/>} />
    <Route path="/joblist" element={<Joblist/>} />
    <Route path="/mbajoblist" element={<Mbajoblist/>} />
    <Route path="/btechjoblist" element={<Btechjoblist/>} />
    <Route path="/jobs/:jobId/mcaregistrations" element={<McajobRegistrations/>} />
    <Route path="/jobs/:jobId/mbaregistrations" element={<MbajobRegistrations/>} />
    <Route path="/jobs/:jobId/btechregistrations" element={<BtechjobRegistrations/>} />
    <Route path="/deletejobs" element={<Deletej/>} />

    <Route path="/addquestion" element={<Addquestions/>} />
    <Route path="/weekreview" element={<Weekreview/>} />
    <Route path="/company/:company/week/:week" element={<Quizdisplay/>} />
    <Route path="/qusers" element={<Qusers/>} />
    <Route path="/updateaptitude" element={<UpdateQuestions/>} />
    <Route path="/aanswer" element={<Aanswer/>} />
    <Route path='/aanswerview' element={<Aanswerview />}/> 
    <Route path="/mbascoretable" element={<AscoreTable />} />
    <Route path="/mcascoretable" element={<McascoreTable />} />
    <Route path="/btechscoretable" element={<BtechscoreTable />} />
    <Route path="/deletequiz" element={<Deletequiz/>} />

    <Route path="/Addoffcampus" element={<Addoffcampus />} />
    <Route path="/Soffcampus" element={<Soffcampus/>} />
    <Route path="/prediction" element={<Prediction/>} />

   <Route path="/weeklist" element={<Aweekslist/>} />
   <Route path="/mbaweeklist" element={<Mbaweekslist/>} />
   <Route path="/btechweeklist" element={<Btechweekslist/>} />
    <Route path="/mcasubmissionss/:week" element={<QmcaSubmissions />} />
    <Route path="/mbasubmissionss/:week" element={<Qmbasubmssions />} />
    <Route path="/btechsubmissionss/:week" element={<Qbtechsubmssions />} />

      
    <Route path="/codingq" element={<Codingq />} />
    <Route path="/cweeks" element={<Cweekss />} />
    <Route path="/compiler/:company/:week" element={<Compiler />} />
    <Route path="/Codingupdate" element={<Codingupdate />} />
    <Route path="/pasttestcases" element={<Passedtestcass/>} />
    <Route path="/passeddisplay" element={<Passeddisplay/>} />
    <Route path="/Fourweek" element={<Fourweek/>} />
    <Route path="/mcaFourweek" element={<Mcafourweek/>} />
    <Route path="/btechFourweek" element={<Btechfourweek/>} />
    <Route path="/addanswers" element={<AddAnswers/>} />
    <Route path="/ucompilers" element={<Ucompilers />} />
    <Route path="/submissionweeks" element={<Weekcompilers/>} />
    <Route path="/mbasubmissionweeks" element={<Mbaweekcompilers/>} />
    <Route path="/btechsubmissionweeks" element={<Btechweekcompilers/>} />
    <Route path="/mcasubmissions/week/:week" element={<McaweekSubmissions/>} />
    <Route path="/mbasubmissions/week/:week" element={<MbaweekSubmissions/>} />
    <Route path="/btechsubmissions/week/:week" element={<BtechweekSubmissions/>} />
    <Route path="/deletecode" element={<Deletecode />} />



      
 
      
    </Routes>
    </BrowserRouter>
  );
}


export default App;
