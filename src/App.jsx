import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';


import Matches from './pages/Matches';
import PreferenceMatches from './pages/PreferenceMatches';
import Home from './pages/Home';
import Messages from './pages/Messages';
import Interests from './pages/Interests';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Help from './pages/Help';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import ContactUs from './pages/ContactUs';
import SuccessStories from './pages/SuccessStories';
import ResetPassword from './pages/ResetPassword';
import ScrollToTop from './components/ScrollToTop';
import Search from './pages/Search';
import MembershipPlans from './pages/MembershipPlans';
import Contacts from './pages/Contacts';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/success-stories" element={<SuccessStories />} />
        
        {/* Main app layout with persistent top nav */}
        <Route element={<MainLayout />}>
          <Route path="/matches" element={<Matches />} />
          <Route path="/home" element={<Home />} />
          <Route path="/feed" element={<Navigate to="/home" replace />} />
          <Route path="/preference-matches" element={<PreferenceMatches />} />
          <Route path="/interests" element={<Interests />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/plans" element={<MembershipPlans />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms-conditions" element={<TermsConditions />} />
          <Route path="/legal/contact-us" element={<ContactUs />} />
        </Route>

        {/* Default route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
