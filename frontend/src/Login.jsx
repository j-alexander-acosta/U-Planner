import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lista de usuarios permitidos
const ALLOWED_USERS = [
    'alexanderacosta@unach.cl',
    'soporte.sistemas@unach.cl'
];

export default function Login({ onLoginSuccess }) {
    const [error, setError] = useState('');

    const handleSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const userEmail = decoded.email;

            // Validación estricta
            if (!userEmail.endsWith('@unach.cl')) {
                setError('Acceso denegado: Usa una cuenta institucional @unach.cl');
                return;
            }

            if (!ALLOWED_USERS.includes(userEmail)) {
                setError('Acceso denegado: Usuario no autorizado en esta fase de pruebas.');
                return;
            }

            // Si es válido
            setError('');
            localStorage.setItem('uplanner_user', JSON.stringify({
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture
            }));

            onLoginSuccess(decoded);

        } catch (err) {
            console.error('Error decoding JWT', err);
            setError('Error al procesar el inicio de sesión.');
        }
    };

    const handleError = () => {
        setError('El inicio de sesión falló. Inténtalo de nuevo.');
    };

    return (
        <div
            className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center font-sans relative overflow-hidden"
            style={{ position: 'relative' }}
        >
            {/* Elementos decorativos de fondo */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '500px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '600px', height: '600px', backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(ellipse at center, rgba(15,23,42,0) 0%, rgba(2,6,23,1) 100%)', pointerEvents: 'none' }}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="glass flex flex-col items-center"
                style={{
                    padding: '2.5rem',
                    borderRadius: '1rem',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    width: '100%',
                    maxWidth: '400px',
                    zIndex: 10,
                    boxShadow: '0 25px 50px -12px rgba(30, 58, 138, 0.3)'
                }}
            >
                <div
                    className="flex items-center justify-center mb-6"
                    style={{ background: 'linear-gradient(to bottom right, #3b82f6, #4f46e5)', padding: '1rem', borderRadius: '50%', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
                >
                    <Calendar size={40} className="text-white" />
                </div>

                <h1 className="text-3xl font-bold gradient-text mb-2 text-center" style={{ marginBottom: '0.5rem' }}>
                    U-Planner
                </h1>
                <p className="text-slate-400 font-medium text-center text-sm" style={{ marginBottom: '2.5rem' }}>
                    Sistema Inteligente de Asignación de Horarios <br />
                    Universidad Adventista de Chile
                </p>

                <div className="w-full flex justify-center" style={{ marginBottom: '1.5rem' }}>
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        useOneTap={false}
                        theme="filled_black"
                        shape="pill"
                        text="continue_with"
                        locale="es_CL"
                    />
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full flex items-start"
                            style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.875rem', gap: '0.75rem', overflow: 'hidden' }}
                        >
                            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p className="font-medium">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="w-full text-center" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}>
                    <p className="text-slate-500" style={{ fontSize: '0.75rem' }}>
                        Acceso restringido para personal autorizado.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
