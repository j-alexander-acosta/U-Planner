import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    DoorOpen,
    Calendar,
    Settings,
    Plus,
    Search,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    X,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import DirectorDashboard from './DirectorDashboard';
import Reports from './Reports';

const Notification = ({ message, type, onClose }) => (
    <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`toast ${type === 'success' ? 'toast-success' : 'toast-error'}`}
    >
        {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70">
            <X size={16} />
        </button>
    </motion.div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <motion.div
        whileHover={{ x: 5 }}
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </motion.div>
);

const StatCard = ({ label, value, trend, icon: Icon }) => (
    <div className="glass p-6 flex items-center justify-between">
        <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            <span className="text-emerald-400 text-xs font-semibold">{trend}</span>
        </div>
        <div className="bg-slate-800 p-3 rounded-xl">
            <Icon className="text-blue-400" size={24} />
        </div>
    </div>
);

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notifications, setNotifications] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userRole, setUserRole] = useState('registro'); // 'registro' | 'director'
    const [selectedFile, setSelectedFile] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedRoomFile, setSelectedRoomFile] = useState(null);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [newRoom, setNewRoom] = useState({ code: '', name: '', capacity: '' });

    const fetchTeachers = async () => {
        try {
            const res = await axios.get('/api/teachers/');
            setTeachers(res.data);
        } catch (err) {
            console.error('Error fetching teachers:', err);
        }
    };

    const fetchRooms = async () => {
        try {
            const res = await axios.get('/api/rooms/');
            setRooms(res.data);
        } catch (err) {
            console.error('Error fetching rooms:', err);
        }
    };

    useEffect(() => {
        if (activeTab === 'teachers') {
            fetchTeachers();
        }
        if (activeTab === 'rooms') {
            fetchRooms();
        }
    }, [activeTab]);
    const [formData, setFormData] = useState({
        teacher_id: '',
        room_id: '',
        subject_id: '',
        time_block_id: ''
    });

    const addNotification = (message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/schedules/', {
                teacher_id: parseInt(formData.teacher_id),
                room_id: parseInt(formData.room_id),
                subject_id: parseInt(formData.subject_id),
                time_block_id: parseInt(formData.time_block_id)
            });

            addNotification('¡Horario creado con éxito!', 'success');
            setIsModalOpen(false);
            setFormData({ teacher_id: '', room_id: '', subject_id: '', time_block_id: '' });
        } catch (error) {
            const errorData = error.response?.data;
            let errorMsg = 'Error al conectar con el servidor';

            if (typeof errorData?.detail === 'string') {
                errorMsg = errorData.detail;
            } else if (Array.isArray(errorData?.detail)) {
                errorMsg = errorData.detail[0]?.msg || 'Error de validación';
            }

            addNotification(errorMsg, 'error');
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100 p-4">
            {/* Notifications */}
            <div className="toast-container">
                <AnimatePresence>
                    {notifications.map(n => (
                        <Notification
                            key={n.id}
                            message={n.message}
                            type={n.type}
                            onClose={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Sidebar */}
            <aside className="w-64 glass p-6 flex flex-col gap-8 mr-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-2 mb-2">
                        <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold">U</div>
                        <h1 className="text-xl font-bold gradient-text">U-Planner</h1>
                    </div>

                    <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                        className="bg-slate-800 border-none text-xs p-2 rounded-lg text-slate-300 outline-none cursor-pointer"
                    >
                        <option value="registro">Registro Académico</option>
                        <option value="director">Director de Carrera</option>
                    </select>
                </div>

                <nav className="flex flex-col gap-2">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <SidebarItem
                        icon={Users}
                        label="Docentes"
                        active={activeTab === 'teachers'}
                        onClick={() => setActiveTab('teachers')}
                    />
                    <SidebarItem
                        icon={BookOpen}
                        label="Asignaturas"
                        active={activeTab === 'subjects'}
                        onClick={() => setActiveTab('subjects')}
                    />
                    <SidebarItem
                        icon={DoorOpen}
                        label="Salas"
                        active={activeTab === 'rooms'}
                        onClick={() => setActiveTab('rooms')}
                    />
                    <SidebarItem
                        icon={Calendar}
                        label="Horarios"
                        active={activeTab === 'schedules'}
                        onClick={() => setActiveTab('schedules')}
                    />
                    <SidebarItem
                        icon={FileText}
                        label="Reportes"
                        active={activeTab === 'reports'}
                        onClick={() => setActiveTab('reports')}
                    />
                </nav>

                <div className="mt-auto">
                    <SidebarItem icon={Settings} label="Ajustes" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col gap-6">
                <header className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">Bienvenido, Alexander</h2>
                        <p className="text-slate-400 mt-1">Gestión académica Universidad Adventista de Chile</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass flex items-center gap-3 px-4 py-2 border border-slate-700">
                            <Search size={18} className="text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="bg-transparent border-none outline-none text-sm w-48"
                            />
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-blue-900/20"
                        >
                            <Plus size={20} />
                            <span>Nuevo Horario</span>
                        </button>
                    </div>
                </header>

                {activeTab === 'reports' ? (
                    <Reports />
                ) : activeTab === 'teachers' ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold">Módulo de Docentes</h2>
                                <p className="text-slate-400 mt-1">Gestión y carga masiva de la plantilla académica</p>
                            </div>
                        </div>

                        {/* Upload Section */}
                        <div className="glass p-6">
                            <h3 className="text-lg font-bold mb-4">Importar Docentes desde Excel</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                El archivo debe tener dos columnas: <strong>Nombre Completo</strong> y <strong>RUT</strong>. La primera fila se considera encabezado.
                            </p>
                            <div className="flex gap-4 items-center flex-wrap">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    id="excel-upload"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            setSelectedFile(e.target.files[0]);
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="excel-upload"
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-3 rounded-lg flex items-center gap-2 font-semibold cursor-pointer transition-all border border-slate-600"
                                >
                                    <FileText size={18} />
                                    {selectedFile ? selectedFile.name : 'Seleccionar Archivo'}
                                </label>

                                <button
                                    disabled={!selectedFile}
                                    onClick={async () => {
                                        if (!selectedFile) return;
                                        const formData = new FormData();
                                        formData.append('file', selectedFile);
                                        try {
                                            const res = await axios.post('/api/teachers/upload-excel/', formData, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            addNotification(`✅ ${res.data.created} docente(s) importados, ${res.data.skipped} omitidos.`, 'success');
                                            setSelectedFile(null);
                                            document.getElementById('excel-upload').value = '';
                                            fetchTeachers();
                                        } catch (err) {
                                            addNotification(err.response?.data?.detail || 'Error al importar', 'error');
                                        }
                                    }}
                                    style={{
                                        backgroundColor: selectedFile ? '#059669' : '#1e293b',
                                        color: '#ffffff',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: 700,
                                        border: 'none',
                                        cursor: selectedFile ? 'pointer' : 'not-allowed',
                                        opacity: selectedFile ? 1 : 0.4,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Plus size={20} />
                                    Subir Docentes
                                </button>
                            </div>
                        </div>

                        {/* Teacher List Placeholder */}
                        <div className="glass p-6">
                            <h3 className="text-lg font-bold mb-4">Plantilla Docente Actual</h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 text-sm border-b border-slate-800">
                                        <th className="pb-4 font-medium">Nombre Completo</th>
                                        <th className="pb-4 font-medium">RUT</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {teachers.length === 0 ? (
                                        <tr className="border-b border-slate-800/50">
                                            <td className="py-6 text-center text-slate-500" colSpan="2">
                                                No hay docentes registrados. Importe un archivo Excel.
                                            </td>
                                        </tr>
                                    ) : (
                                        teachers.map((t) => (
                                            <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                <td className="py-3 font-semibold">{t.full_name}</td>
                                                <td className="py-3 text-slate-400">{t.rut}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'subjects' ? (
                    <div className="glass p-8 text-center text-slate-400">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-white">Catálogo de Asignaturas</h3>
                        <p>Administración de currícula y cupos por carrera.</p>
                    </div>
                ) : activeTab === 'rooms' ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold">Módulo de Salas</h2>
                                <p className="text-slate-400 mt-1">Gestión de salas, laboratorios y aulas</p>
                            </div>
                            <button
                                onClick={() => setShowCreateRoom(!showCreateRoom)}
                                style={{
                                    backgroundColor: '#2563eb',
                                    color: '#fff',
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: 600,
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={18} />
                                {showCreateRoom ? 'Cancelar' : 'Crear Sala'}
                            </button>
                        </div>

                        {/* Manual Creation */}
                        {showCreateRoom && (
                            <div className="glass p-6">
                                <h3 className="text-lg font-bold mb-4">Crear Sala Manualmente</h3>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label className="text-slate-400 text-xs">Código</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: LAB-101"
                                            value={newRoom.code}
                                            onChange={(e) => setNewRoom({ ...newRoom, code: e.target.value })}
                                            style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', outline: 'none', width: '160px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label className="text-slate-400 text-xs">Nombre</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Laboratorio Informática"
                                            value={newRoom.name}
                                            onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                            style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', outline: 'none', width: '260px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label className="text-slate-400 text-xs">Capacidad</label>
                                        <input
                                            type="number"
                                            placeholder="Ej: 40"
                                            value={newRoom.capacity}
                                            onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                                            style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', outline: 'none', width: '100px' }}
                                        />
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!newRoom.code || !newRoom.name || !newRoom.capacity) {
                                                addNotification('Completa todos los campos', 'error');
                                                return;
                                            }
                                            try {
                                                await axios.post('/api/rooms/', {
                                                    code: newRoom.code,
                                                    name: newRoom.name,
                                                    capacity: parseInt(newRoom.capacity)
                                                });
                                                addNotification('Sala creada con éxito', 'success');
                                                setNewRoom({ code: '', name: '', capacity: '' });
                                                setShowCreateRoom(false);
                                                fetchRooms();
                                            } catch (err) {
                                                addNotification(err.response?.data?.detail || 'Error al crear sala', 'error');
                                            }
                                        }}
                                        style={{
                                            backgroundColor: '#059669',
                                            color: '#fff',
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            fontWeight: 700,
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Excel Upload */}
                        <div className="glass p-6">
                            <h3 className="text-lg font-bold mb-4">Importar Salas desde Excel</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                El archivo debe tener tres columnas: <strong>CODSALA</strong>, <strong>NOMBRE</strong> y <strong>CAPACIDAD</strong>.
                            </p>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    id="room-excel-upload"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files[0]) setSelectedRoomFile(e.target.files[0]);
                                    }}
                                />
                                <label
                                    htmlFor="room-excel-upload"
                                    style={{
                                        backgroundColor: '#1e293b',
                                        color: '#94a3b8',
                                        padding: '12px 20px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        border: '1px solid #475569'
                                    }}
                                >
                                    <FileText size={18} />
                                    {selectedRoomFile ? selectedRoomFile.name : 'Seleccionar Archivo'}
                                </label>
                                <button
                                    disabled={!selectedRoomFile}
                                    onClick={async () => {
                                        if (!selectedRoomFile) return;
                                        const formData = new FormData();
                                        formData.append('file', selectedRoomFile);
                                        try {
                                            const res = await axios.post('/api/rooms/upload-excel/', formData, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            addNotification(`✅ ${res.data.created} sala(s) importadas, ${res.data.skipped} omitidas.`, 'success');
                                            setSelectedRoomFile(null);
                                            document.getElementById('room-excel-upload').value = '';
                                            fetchRooms();
                                        } catch (err) {
                                            addNotification(err.response?.data?.detail || 'Error al importar', 'error');
                                        }
                                    }}
                                    style={{
                                        backgroundColor: selectedRoomFile ? '#059669' : '#1e293b',
                                        color: '#ffffff',
                                        padding: '12px 24px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: 700,
                                        border: 'none',
                                        cursor: selectedRoomFile ? 'pointer' : 'not-allowed',
                                        opacity: selectedRoomFile ? 1 : 0.4
                                    }}
                                >
                                    <Plus size={20} />
                                    Subir Salas
                                </button>
                            </div>
                        </div>

                        {/* Room List */}
                        <div className="glass p-6">
                            <h3 className="text-lg font-bold mb-4">Listado de Salas</h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 text-sm border-b border-slate-800">
                                        <th className="pb-4 font-medium">Código</th>
                                        <th className="pb-4 font-medium">Nombre</th>
                                        <th className="pb-4 font-medium">Capacidad</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {rooms.length === 0 ? (
                                        <tr className="border-b border-slate-800/50">
                                            <td className="py-6 text-center text-slate-500" colSpan="3">
                                                No hay salas registradas.
                                            </td>
                                        </tr>
                                    ) : (
                                        rooms.map((r) => (
                                            <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                <td className="py-3 font-mono text-blue-400">{r.code}</td>
                                                <td className="py-3 font-semibold">{r.name}</td>
                                                <td className="py-3 text-slate-400">{r.capacity}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'schedules' ? (
                    <div className="glass p-8 text-center text-slate-400">
                        <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-white">Visor de Horarios</h3>
                        <p>Vista completa de la programación académica.</p>
                    </div>
                ) : userRole === 'director' ? (
                    <DirectorDashboard />
                ) : (
                    <>
                        {/* Modal New Schedule */}
                        <AnimatePresence>
                            {isModalOpen && (
                                <div className="modal-overlay">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        className="modal-content"
                                    >
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold">Crear Nuevo Horario</h3>
                                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <form onSubmit={handleCreateSchedule}>
                                            <div className="input-group">
                                                <label>ID Docente</label>
                                                <input
                                                    required
                                                    type="number"
                                                    className="input-field"
                                                    placeholder="Ej: 1"
                                                    value={formData.teacher_id}
                                                    onChange={e => setFormData({ ...formData, teacher_id: e.target.value })}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label>ID Sala</label>
                                                <input
                                                    required
                                                    type="number"
                                                    className="input-field"
                                                    placeholder="Ej: 5"
                                                    value={formData.room_id}
                                                    onChange={e => setFormData({ ...formData, room_id: e.target.value })}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label>ID Asignatura</label>
                                                <input
                                                    required
                                                    type="number"
                                                    className="input-field"
                                                    placeholder="Ej: 10"
                                                    value={formData.subject_id}
                                                    onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label>ID Bloque Horario</label>
                                                <input
                                                    required
                                                    type="number"
                                                    className="input-field"
                                                    placeholder="Ej: 3"
                                                    value={formData.time_block_id}
                                                    onChange={e => setFormData({ ...formData, time_block_id: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex gap-4 mt-8">
                                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                                                    Cancelar
                                                </button>
                                                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex-1">
                                                    Guardar Horario
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Total Docentes" value="124" trend="+4 este mes" icon={Users} />
                            <StatCard label="Salas Ocupadas" value="18/42" trend="42% capacidad" icon={DoorOpen} />
                            <StatCard label="Asignaturas" value="312" trend="En progreso" icon={BookOpen} />
                            <StatCard label="Conflictos" value="0" trend="Optimizado" icon={Calendar} />
                        </section>

                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 glass p-6 overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold">Asignaciones Sugeridas</h3>
                                    <button className="text-blue-400 text-sm font-semibold flex items-center gap-1 hover:text-blue-300">
                                        Ver todo <ChevronRight size={16} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-slate-500 text-sm border-b border-slate-800">
                                                <th className="pb-4 font-medium">Asignatura</th>
                                                <th className="pb-4 font-medium">Docente</th>
                                                <th className="pb-4 font-medium">Sala</th>
                                                <th className="pb-4 font-medium">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                                                    <td className="py-4 font-semibold">Cálculo Multivariable</td>
                                                    <td className="py-4 text-slate-400">Dr. Ricardo Pérez</td>
                                                    <td className="py-4 text-slate-400">Lab. Computación 1</td>
                                                    <td className="py-4">
                                                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-500/20">
                                                            Confirmado
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="glass p-6 flex flex-col gap-6">
                                <h3 className="text-xl font-bold">Disponibilidad Laboratorios</h3>
                                <div className="flex flex-col gap-4">
                                    {[
                                        { name: 'Computación', usage: 85 },
                                        { name: 'Ciencias Básicas', usage: 45 },
                                        { name: 'Salud / Simulación', usage: 60 },
                                        { name: 'Talleres', usage: 30 }
                                    ].map((lab) => (
                                        <div key={lab.name} className="flex flex-col gap-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">{lab.name}</span>
                                                <span className="font-bold">{lab.usage}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${lab.usage}%` }}
                                                    className={`h-full ${lab.usage > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
