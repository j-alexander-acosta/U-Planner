import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import Login from './Login.jsx'
import './index.css'

const clientId = "TU_CLIENT_ID_DE_GOOGLE_AQUI"; // REEMPLAZAR CON EL CLIENT ID REAL

function MainApp() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('uplanner_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('uplanner_user');
        setUser(null);
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {user ? (
                <App user={user} onLogout={handleLogout} />
            ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
            )}
        </GoogleOAuthProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <MainApp />
    </React.StrictMode>,
)
