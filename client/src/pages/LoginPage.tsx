import React, { useEffect } from 'react';
import { getUserId } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {

    const userIdFromDB = getUserId();
    const navigate = useNavigate();

    useEffect(() => {
        if (userIdFromDB) {
            navigate('/');
        }
    }, [navigate, userIdFromDB]);

    const handleLogin = () => {
        window.location.href = 'http://localhost:4000/auth/google';
    };



    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <button
                onClick={handleLogin}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#4285F4',
                    color: '#fff',
                    cursor: 'pointer'
                }}
            >
                Sign in with Google
            </button>
        </div>
    );
};

export default LoginPage;
