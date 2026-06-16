import React, { Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import FallBackComponent from './components/Fallback';
import { useDispatch } from 'react-redux';
import ProtectedRoute from './components/ProtectedRoute';
//import InstallBanner from './components/PWA';
import DepositDetail from "./screens/Deposit-detail";

import Login from './screens/Login';
import Verification from './screens/Verification';
import Notification from './screens/Notification';

import Settings from './screens/Settings';
import Profile from './screens/Profile';

import Portfolio from './screens/Portfolio';
import { checkIfIsLoggedIn, logout } from "./store/action/appStorage";
import TradeCenter from "./screens/Trade-center";
import Upgrade from "./screens/Upgrade";
import FundAccount from "./screens/FundAccount";
import Withdraw from "./screens/Withdraw";

import { generateToken, messaging } from './notifications/firebase';
import { onMessage } from "firebase/messaging";
import { NotificationToast } from "./component/general/Notification";

import { toast, Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//import Registeration from './screens/Registeration';
//import ProfilePhoto from './screens/ProfilePhoto';
import ImgUrl from  './assets/192.png';
import Signup from "./screens/Signup";
import Pin from "./screens/PinSetting";
import CopyTrade from "./screens/CopyTrade";


function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const apiCall = async () => {
      const res = await dispatch(checkIfIsLoggedIn());
      if (res.bool) {
        navigate('/invest');
        generateToken(res.message.user);
        onMessage(messaging, (payload) => {
          toast(<NotificationToast
            title={payload.notification.title}
            message={payload.notification.body}
            image={ImgUrl}
            style={{ borderRadius: '8px', color: 'white' }}
          />
            , {
              backgroundColor: '#0C1125',
              position: "top-right",
              autoClose: false,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              transition: Slide,

            });
        });
      }
      setIsLoading(false);
    };
    apiCall();
  }, []);

  useEffect(() => {
    if (location.pathname === '/logout') {
      dispatch(logout());
      navigate('/login');
    }
  }, [location]);


  if (isLoading) {
    return <FallBackComponent />;
  }

  return (
    <div className="App">
      <Suspense fallback={<FallBackComponent />}>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/verification' element={<Verification />} />
          <Route path='/notification' element={<Notification />} />
          {/* Protected Routes */}

          <Route path='/settings' element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path='/invest' element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />

          <Route path='/portfolio' element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />

          <Route path='/trade-center' element={<ProtectedRoute><TradeCenter /></ProtectedRoute>} />
          <Route path='/upgrade' element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
          <Route path='/fund-account' element={<ProtectedRoute><FundAccount /></ProtectedRoute>} />
          <Route path='/withdraw' element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
          <Route path='/deposit-detail' element={<ProtectedRoute><DepositDetail /></ProtectedRoute>} />

          {/*<Route path='/registeration' element={<ProtectedRoute><Registeration /></ProtectedRoute>} />
          <Route path='/profilephoto' element={<ProtectedRoute><ProfilePhoto /></ProtectedRoute>} />*/}

          <Route path='/pin' element={<ProtectedRoute><Pin /></ProtectedRoute>} />


          <Route path='/copy-trading' element={<ProtectedRoute><CopyTrade /></ProtectedRoute>} />
        </Routes>
      </Suspense>
      {/* ✅ Toast container must be present for toasts to show */}
      <ToastContainer />
    </div>
  );
}

export default App;


