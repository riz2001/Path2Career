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

function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route path='/' element={<CreateInterview/>}/>
    <Route path='/i' element={<InterviewList/>}/>
    <Route path="/generate-questions/:interviewId" element={<ViewQuestions />} />
    <Route path="/signin" element={<Usignin/>} />
    <Route path="/ureg" element={<Ureg />} />
    <Route path="/mcaapprove" element={<Mcaapprove/>} />
    <Route path="/mbaapprove" element={<Mbapprove/>} />
    <Route path="/btechapprove" element={<Btechapprove/>} />

    <Route path="/addjob" element={<AddJob/>} />
    <Route path="/viewjobs" element={<ViewJobs/>} />
    <Route path="/joblist" element={<Joblist/>} />
    <Route path="/jobs/:jobId/mcaregistrations" element={<McajobRegistrations/>} />
    <Route path="/jobs/:jobId/mbaregistrations" element={<MbajobRegistrations/>} />
    <Route path="/jobs/:jobId/btechregistrations" element={<BtechjobRegistrations/>} />

    <Route path="/addquestion" element={<Addquestions/>} />
    <Route path="/weeks" element={<Weekreview/>} />
    <Route path="/company/:company/week/:week" element={<Quizdisplay/>} />


   <Route path="/weeklist" element={<Aweekslist/>} />
    <Route path="/submissions/:week" element={<QmcaSubmissions />} />
    <Route path="/mbasubmissions/:week" element={<Qmbasubmssions />} />
    <Route path="/btechsubmissions/:week" element={<Qbtechsubmssions />} />

      



      
 
      
    </Routes>
    </BrowserRouter>
  );
}


export default App;
