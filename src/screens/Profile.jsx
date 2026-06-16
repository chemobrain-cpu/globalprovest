import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';
import axios from 'axios';
import DesktopSideBar from '../components/DesktopSideBar';
import BackHeader from '../components/DashboardHeader';
import { useSelector } from 'react-redux';
import ProfileModal from '../Modal/ProfileModal';
import AuthModal from '../Modal/AuthModal';
import Sidebar from '../components/MobileSideBar';


const Profile = () => {
    const [cryptoData, setCryptoData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [propertyName, setPropertyName] = useState('');
    const [propertyValue, setPropertyValue] = useState('');

    let { user,investment } = useSelector(state => state.userAuth);
    const navigate = useNavigate();

    const [isAuthError, setIsAuthError] = useState(false);
    const [authInfo, setAuthInfo] = useState("");

    const updateAuthError = () => {
        setIsAuthError(prev => !prev);
        setAuthInfo('');
    };

    useEffect(() => {
        const fetchCryptoData = async () => {
            if (loading) return;
            try {
                const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                    params: {
                        vs_currency: 'usd',
                        order: 'market_cap_desc',
                        per_page: 20,
                        page: 1
                    }
                });
                setCryptoData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching crypto data:', error);
                setLoading(false);
            }
        };
        fetchCryptoData();
    }, []);

    const navigateHandler = () => navigate(-1);

    const handleEditHandler = () => {
        navigate('/registeration');
    };

    const openModal = (propertyName, propertyValue) => {
        setOpenProfileModal(true);
        setPropertyName(propertyName);
        setPropertyValue(propertyValue);
    };

    const hideProfileModal = () => {
        setOpenProfileModal(false);
    };

    const navigateMobileHandler = (url) => {
        return navigate(`/${url}`);
    };

    const notificationHandler = () => {
        navigate('/notifications');
    };

    const openMobileMenu = () => {
        setSidebarOpen(prev => !prev);
    };
   

    return (
        <>
            {isAuthError && (
                <AuthModal modalVisible={isAuthError} updateVisibility={updateAuthError} message={authInfo} />
            )}
            {openProfileModal && (
                <ProfileModal
                    hideModal={hideProfileModal}
                    propertyName={propertyName}
                    propertyValue={propertyValue}
                />
            )}

            <div className={styles.dashboard}>
                <div className={styles.leftSection}>
                    <DesktopSideBar navigateMobileHandler={navigateMobileHandler} />
                </div>

                {sidebarOpen && (
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        isInvest={true}
                        navigateMobileHandler={navigateMobileHandler}
                    />
                )}

                <div className={styles.mainSection}>
                    <BackHeader
                        openMobileMenu={openMobileMenu}
                        notificationHandler={notificationHandler}
                        sidebarOpen={sidebarOpen}
                        title="Profile"
                    />




                    <div className={styles.dashboardContent}>
                        <div className={styles.dashboardContentleft}>
                            <div className={styles.profileCard}>
                                <div className={styles.profileTop}>
                                    <div className={styles.avatarWrapper}>
                                        <img
                                            src={user.profilePhotoUrl || 'https://img.icons8.com/ios-filled/100/ffffff/user-male-circle.png'}
                                            alt="User Avatar"
                                            className={styles.avatar}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://img.icons8.com/ios-filled/100/ffffff/user-male-circle.png';
                                            }}
                                        />
                                        <div className={styles.editIconWrapper}>
                                            <img
                                                src="https://img.icons8.com/material-outlined/24/ffffff/pencil--v1.png"
                                                alt="Edit"
                                                className={styles.editIcon}
                                                onClick={() => console.log('Change profile picture')}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.userDetails}>
                                        <h2 className={styles.name}>
                                            {user.firstName.slice(0, 8)} {user.lastName.slice(0, 8)}
                                        </h2>
                                        <p className={styles.email}>{user.email.slice(0, 15)}...</p>
                                    </div>
                                </div>

                                <div className={styles.divider} />

                                <div className={styles.detailsSection}>
                                    <div className={styles.detailItem} onClick={() => openModal('Password', user.password)}>
                                        <span className={styles.label}>Password</span>
                                        <p className={styles.value}>{user.password || ''}</p>
                                    </div>
                                    <div className={styles.detailItem} onClick={() => openModal('NID', user.nid)}>
                                        <span className={styles.label}>NID</span>
                                        <p className={styles.value}>{user.nid || ''}</p>
                                    </div>
                                    <div className={styles.detailItem} onClick={() => openModal('Country', user.country)}>
                                        <span className={styles.label}>Country</span>
                                        <p className={styles.value}>{user.country || ''}</p>
                                    </div>
                                    <div className={styles.detailItem} onClick={() => openModal('State', user.state)}>
                                        <span className={styles.label}>State</span>
                                        <p className={styles.value}>{user.state || ''}</p>
                                    </div>
                                    <div className={styles.detailItem} onClick={() => openModal('Address', user.address)}>
                                        <span className={styles.label}>Address</span>
                                        <p className={styles.value}>{user.address ? user.address.slice(0, 14) : ''}...</p>
                                    </div>
                                    
                                </div>

                                <div className={styles.buttonWrapper}>
                                    <button className={styles.editProfileBtn} onClick={handleEditHandler}>
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.dashboardContentright}></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
