import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import Spinner from "react-activity/dist/Spinner";
import "react-activity/dist/Spinner.css";
import { getNames } from 'country-list';
import AuthModal from '../Modal/AuthModal';
import { signup, fetchPackages } from '../store/action/appStorage';
import { useDispatch } from 'react-redux';

const countries = getNames();

const SignUpScreen = () => {
    const dispatch = useDispatch();
    const [isAuthError, setIsAuthError] = useState(false);
    const [authInfo, setAuthInfo] = useState('');
    const [investmentPackage, setInvestmentPackage] = useState([]);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        country: '',
        password: '',
        confirmPassword: '',
        accountPackage: null,
        phone: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // ✅ NEW: package loading state
    const [isPackageLoading, setIsPackageLoading] = useState(true);

    const navigate = useNavigate();

    const loadInvestmentPackage = async () => {
        setIsPackageLoading(true); // start loading

        let res = await dispatch(fetchPackages());

        if (!res.bool) {
            setIsAuthError(true);
            setAuthInfo(res.message);
            setIsPackageLoading(false); // stop loading
            return;
        }

        setInvestmentPackage(res.message);
        setIsPackageLoading(false); // stop loading
    };

    useEffect(() => {
        loadInvestmentPackage();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "accountPackage") {
            const selectedPackage = investmentPackage.find(pkg => pkg._id === value);
            setForm(prev => ({ ...prev, accountPackage: selectedPackage }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }

        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const updateAuthError = () => {
        setIsAuthError(false);
        setAuthInfo('');
    };

    const validate = () => {
        const newErrors = {};
        if (!form.firstName) newErrors.firstName = "First name is required";
        if (!form.lastName) newErrors.lastName = "Last name is required";
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Invalid email";
        if (!form.password) newErrors.password = "Password is required";
        if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        if (!form.gender) newErrors.gender = "Select gender";
        if (!form.country) newErrors.country = "Select country";
        if (!form.phone) newErrors.phone = "Phone number is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = async () => {
        if (isLoading) return;

        if (!form.accountPackage) {
            setIsAuthError(true);
            setAuthInfo("Please select an investment package to continue.");
            return;
        }

        if (!validate()) return;
        setIsLoading(true);

        const payload = {
            ...form,
            package: form.accountPackage?._id
        };

        const res = await dispatch(signup(payload));

        if (!res.bool) {
            setIsLoading(false);
            setIsAuthError(true);
            setAuthInfo(res.message);
            return;
        }

        setIsLoading(false);
        if (res.url) {
            navigate(`/${res.url}`, { state: { email: form.email } });
        }
    };

    return (
        <>
            {/* ✅ FULL SCREEN LOADING MODAL */}
            {isPackageLoading && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999
                }}>
                    <Spinner size={50} color="#fff" />
                </div>
            )}

            {isAuthError && (
                <AuthModal modalVisible={isAuthError} updateVisibility={updateAuthError} message={authInfo} />
            )}

            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <h2 className={styles.title}>Sign Up</h2>
                    <p className={styles.description}>Create your account below</p>

                    <input name="firstName" placeholder="First Name" className={styles.input} value={form.firstName} onChange={handleChange} />
                    <p className={styles.error}>{errors.firstName}</p>

                    <input name="lastName" placeholder="Last Name" className={styles.input} value={form.lastName} onChange={handleChange} />
                    <p className={styles.error}>{errors.lastName}</p>

                    <input name="email" type="email" placeholder="Email" className={styles.input} value={form.email} onChange={handleChange} />
                    <p className={styles.error}>{errors.email}</p>

                    <select name="gender" className={styles.input} value={form.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    <p className={styles.error}>{errors.gender}</p>

                    <select name="country" className={styles.input} value={form.country} onChange={handleChange}>
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                    <p className={styles.error}>{errors.country}</p>

                    <input name="phone" placeholder="Phone Number" className={styles.input} value={form.phone} onChange={handleChange} />
                    <p className={styles.error}>{errors.phone}</p>

                    <select
                        name="accountPackage"
                        className={styles.input}
                        value={form.accountPackage?._id || ''}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Account Package</option>
                        {investmentPackage.map(pkg => (
                            <option key={pkg._id} value={pkg._id}>
                                {pkg.name}
                            </option>
                        ))}
                    </select>

                    <input name="password" type="password" placeholder="Password" className={styles.input} value={form.password} onChange={handleChange} />
                    <p className={styles.error}>{errors.password}</p>

                    <input name="confirmPassword" type="password" placeholder="Confirm Password" className={styles.input} value={form.confirmPassword} onChange={handleChange} />
                    <p className={styles.error}>{errors.confirmPassword}</p>

                    <button className={styles.button} onClick={submitHandler}>
                        {isLoading ? <Spinner size={10} color="#fff" /> : 'Sign Up'}
                    </button>

                    <div className={styles.termsText}>
                        Have an account? Click <span className={styles.link} onClick={() => navigate('/login')}>here</span> to login.
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignUpScreen;


