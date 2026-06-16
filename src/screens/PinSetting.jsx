import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Withdraw.module.css';
import DesktopSideBar from '../components/DesktopSideBar';
import Sidebar from '../components/MobileSideBar';
import AuthModal from '../Modal/AuthModal';
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword } from '../store/action/appStorage';



const PasswordUpdate = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthError, setIsAuthError] = useState(false);
  const [authInfo, setAuthInfo] = useState('');
   const { user } = useSelector(state => state.userAuth);
  const [formData, setFormData] = useState({
    currentPassword:user.password, // masked placeholder
    newPassword: ''
  });

 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const updateAuthError = () => {
    setIsAuthError(prev => !prev);
    setAuthInfo('');
  };

  const handleChangeHandler = (e, nameField) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, [nameField]: val }));
  };

  const updatePasswordHandler = async () => {
    if (!formData.newPassword) {
      setIsAuthError(true);
      setAuthInfo('Please enter a new password.');
      return;
    }

    try {
      // dispatch update password action here
      await dispatch(updatePassword({...formData,email:user.email}));

      console.log(formData)

      setIsAuthError(true);
      setAuthInfo('Password updated successfully!');
    } catch (error) {
      setIsAuthError(true);
      setAuthInfo(error.message || 'Something went wrong.');
    }
  };

  return (
    <>
      {isAuthError && (
        <AuthModal
          modalVisible={isAuthError}
          updateVisibility={updateAuthError}
          message={authInfo}
        />
      )}

      <div className={styles.dashboard}>
        <div className={styles.leftSection}>
          <DesktopSideBar />
        </div>

        {sidebarOpen && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <div className={styles.mainSection}>
          <div className={styles.card} data-aos="fade-up">
            <h2 className={styles.cardTitle} style={{color:'grey'}}>Update Password</h2>

            <div className={styles.formGroup}>
              <label>Current Password</label>
              <input
                type="text"
                className={styles.input}
                value={formData.currentPassword}
              
              />
            </div>

            <div className={styles.formGroup}>
              <label>New Password</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) => handleChangeHandler(e, 'newPassword')}
              />
            </div>

            <button
              className={styles.button}
              onClick={updatePasswordHandler}
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordUpdate;
