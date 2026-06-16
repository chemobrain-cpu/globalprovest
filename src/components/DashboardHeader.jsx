import React from 'react';
import styles from './DashboardHeader.module.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';


const DesktopHeader = ({ openMobileMenu,title }) => {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.userAuth);

    return (
        <div>
            <div className={styles.logoWrapper}>
                <img
                    src="/provest.png"
                    alt="GlobalProvest"
                    className={styles.logo}
                />
            </div>

            <div className={styles.headerWrapper}>

                <div className={styles.leftSection}>
                    <div className={styles.menuBox}>


                        <HiOutlineAdjustmentsHorizontal
                            size={26}
                            color="#6A5AF9"
                            onClick={openMobileMenu}
                            className={styles.menuIcon}
                        />
                    </div>

                    <h3 className={styles.menuText}>{title}</h3>

                    <div className={styles.userSection}>
                        <div className={styles.userInfo}>
                            <h3>
                                {user?.firstName} {user?.lastName}
                            </h3>

                            <p>
                                {user?.email}
                            </p>
                        </div>

                        <div
                            className={styles.avatar}
                            onClick={() => navigate('/profile')}
                        >
                            {user?.profilePhotoUrl ? (
                                <img
                                    src={user.profilePhotoUrl}
                                    alt="profile"
                                />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="#666"
                                >
                                    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                                </svg>
                            )}
                        </div>
                    </div>

                </div>


            </div>
        </div>

    );
};

export default DesktopHeader;