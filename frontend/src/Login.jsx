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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden font-sans">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0)_0%,rgba(2,6,23,1)_100%)] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="glass p-10 rounded-2xl border border-slate-700/50 w-full max-w-md relative z-10 flex flex-col items-center shadow-2xl shadow-blue-900/20"
            >
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full mb-6 shadow-lg shadow-blue-500/30">
                    <Calendar size={40} className="text-white" />
                </div>

                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2 text-center">
                    U-Planner
                </h1>
                <p className="text-slate-400 font-medium mb-10 text-center text-sm">
                    Sistema Inteligente de Asignación de Horarios <br />
                    Universidad Adventista de Chile
                </p>

                <div className="w-full flex justify-center mb-6">
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
                            className="bg-rose-500/10 border border-rose-500/30 text-rose-400 w-full p-4 rounded-xl flex gap-3 text-sm items-start overflow-hidden"
                        >
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p className="font-medium">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 pt-6 border-t border-slate-700/50 w-full text-center">
                    <p className="text-xs text-slate-500">
                        Acceso restringido para personal autorizado.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
