import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/action/appStorage';
import styles from './Login.module.css';
import AuthModal from '../Modal/AuthModal';
import Spinner from "react-activity/dist/Spinner";
import "react-activity/dist/Spinner.css";

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isEmailValid, setIsEmailValid] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [isAuthError, setIsAuthError] = useState(false);
    const [authInfo, setAuthInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const updateAuthError = () => {
        setIsAuthError(false);
        setAuthInfo('');
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setIsEmailValid('');
        updateDisabledState(value, password);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        setIsPasswordValid('');
        updateDisabledState(email, value);
    };

    const updateDisabledState = (email, password) => {
        setIsDisabled(email.trim() === '' || password.trim() === '');
    };

    const submitHandler = async () => {
        if (isLoading) return;

        if (!email || !isValidEmail(email)) {
            setIsEmailValid('Enter a valid email');
            return;
        }

        if (!password || password.length < 4) {
            setIsPasswordValid('Password must be at least 4 characters');
            return;
        }

        setIsEmailValid('');
        setIsPasswordValid('');
        setIsLoading(true);

        const res = await dispatch(login({ email, password }));

        if (!res.bool) {
            setIsLoading(false);
            setIsAuthError(true);
            setAuthInfo(res.message);
            return;
        }
       
        if(res.url){
            if(res.url === 'verification'){
                navigate(`/${res.url}`,{state:{email:email}})
            }else{
                navigate(`/${res.url}`)
            }
          
        }
        setIsLoading(false);

    };


    const navigateHandler = () => {
        navigate('/signup')

    }

    return (
        <>
            {isAuthError && (
                <AuthModal modalVisible={isAuthError} updateVisibility={updateAuthError} message={authInfo} />
            )}
            <div className={styles.container} style={{height:'100vh'}}>
                <div className={styles.innerContainer}>

                    <h2 className={styles.title}>Log in or Create</h2>
                    <h3 className={styles.subtitle}>Account</h3>
                    <p className={styles.description}>Sign in with your email and password.</p>

                    <input
                        type="email"
                        className={styles.input}
                        placeholder="Enter your email"
                        value={email}
                        onChange={handleEmailChange}
                    />
                    <p className={styles.error}>{isEmailValid}</p>

                    <input
                        type="password"
                        className={styles.input}
                        placeholder="Enter your password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                    <p className={styles.error}>{isPasswordValid}</p>

                    <button
                        className={`${styles.button} ${isDisabled ? styles.disabledButton : ''}`}
                        disabled={isDisabled}
                        onClick={submitHandler}
                    >
                        {isLoading ? (
                            <Spinner size={10} color="#fff" className={styles.loader} />
                        ) : 'Continue'}
                    </button>
                    
                    <div className={styles.termsText}>
                    Don't have an account click <span className={styles.link} onClick={navigateHandler}>here</span> to register
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginScreen;



