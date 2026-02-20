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
    FileText,
    Pencil,
    Check,
    Filter,
    ArrowUpDown,
    Clock
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
    const [selectedDay, setSelectedDay] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomsSubTab, setRoomsSubTab] = useState('listado');
    const [roomsDayFilter, setRoomsDayFilter] = useState('Todos');
    const [roomsModuleFilter, setRoomsModuleFilter] = useState('Todos');
    const [userRole, setUserRole] = useState('registro'); // 'registro' | 'director'
    const [selectedFile, setSelectedFile] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);


    const [subjects, setSubjects] = useState([]);
    const [days, setDays] = useState([]);
    const [timeModules, setTimeModules] = useState([]);
    const [academicSchedules, setAcademicSchedules] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchTeachers = async () => {
        try {
            const res = await axios.get('/api/teachers/');
            setTeachers(res.data);
        } catch (err) {
            console.error('Error fetching teachers:', err);
        }
    };

    const [teacherColumnFilters, setTeacherColumnFilters] = useState({
        rut: '',
        full_name: ''
    });

    const filteredTeachers = teachers.filter(teacher => {
        return Object.entries(teacherColumnFilters).every(([key, value]) => {
            if (!value) return true;
            const searchTerm = value.toLowerCase();
            const teacherValue = String(teacher[key] || '').toLowerCase();
            return teacherValue.includes(searchTerm);
        });
    });

    const [roomColumnFilters, setRoomColumnFilters] = useState({
        code: '',
        name: '',
        capacity: ''
    });

    const filteredRooms = rooms.filter(room => {
        return Object.entries(roomColumnFilters).every(([key, value]) => {
            if (!value) return true;
            const searchTerm = value.toLowerCase();
            const roomValue = String(room[key] || '').toLowerCase();
            return roomValue.includes(searchTerm);
        });
    });

    const [academicScheduleColumnFilters, setAcademicScheduleColumnFilters] = useState({
        carrera: '',
        nivel: '',
        dia: '',
        modulo_horario: '',
        sala: '',
        seccion: '',
        codramo: '',
        asignatura: '',
        docente: ''
    });




    const filteredAcademicSchedules = academicSchedules.filter(sched => {
        return Object.entries(academicScheduleColumnFilters).every(([key, value]) => {
            if (!value) return true;
            const searchTerm = value.toLowerCase();
            const schedValue = String(sched[key] || '').toLowerCase();
            return schedValue.includes(searchTerm);
        });
    });




    const fetchRooms = async () => {
        try {
            const res = await axios.get('/api/rooms/');
            setRooms(res.data);
        } catch (err) {
            console.error('Error fetching rooms:', err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await axios.get('/api/subjects/?limit=10000');
            setSubjects(res.data);
        } catch (err) {
            console.error('Error fetching subjects:', err);
        }
    };

    const fetchDays = async () => {
        try {
            const res = await axios.get('/api/days/');
            setDays(res.data);
        } catch (err) {
            console.error('Error fetching days:', err);
        }
    };

    const fetchTimeModules = async () => {
        try {
            const res = await axios.get('/api/time-modules/');
            setTimeModules(res.data);
        } catch (err) {
            console.error('Error fetching time modules:', err);
        }
    };


    useEffect(() => {
        if (activeTab === 'teachers') {
            fetchTeachers();
        }
        if (activeTab === 'rooms') {
            fetchRooms();
            fetchAcademicSchedules();
            fetchDays();
            fetchTimeModules();
        }
        if (activeTab === 'subjects') {
            fetchSubjects();
        }
        if (activeTab === 'days') {
            fetchDays();
        }
        if (activeTab === 'timeModules') {
            fetchTimeModules();
        }
        if (activeTab === 'schedules') {
            fetchAcademicSchedules();
        }
    }, [activeTab]);

    const fetchAcademicSchedules = async () => {
        try {
            const res = await axios.get('/api/academic-schedules/');
            setAcademicSchedules(res.data);
        } catch (err) {
            console.error('Error fetching academic schedules:', err);
        }
    };



    const [columnFilters, setColumnFilters] = useState({
        plan_year: '',
        career_code: '',
        faculty: '',
        level: '',
        code: '',
        name: '',
        equivalent: '',
        section: '',
        enrolled_students: ''
    });

    // Derived state for Subjects
    const filteredSubjects = subjects.filter(subject => {
        return Object.entries(columnFilters).every(([key, value]) => {
            if (!value) return true;
            const searchTerm = value.toLowerCase();

            let subjectValue = '';
            if (key === 'faculty') {
                subjectValue = subject.faculty?.name || 'General';
            } else {
                subjectValue = String(subject[key] || '');
            }

            return subjectValue.toLowerCase().includes(searchTerm);
        });
    });

    const handleColumnFilterChange = (key, value) => {
        setColumnFilters(prev => ({ ...prev, [key]: value }));
    };
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

    const handleSyncGoogleSheets = async () => {
        setIsSyncing(true);
        try {
            const res = await axios.post('/api/sync/google-sheets/');
            addNotification(`Sincronización completada: ${res.data.rows_processed} filas procesadas`, 'success');
            // Refresh data if we are on a relevant tab
            if (activeTab === 'teachers') fetchTeachers();
            if (activeTab === 'rooms') fetchRooms();
            if (activeTab === 'subjects') fetchSubjects();
            if (activeTab === 'days') fetchDays();
            if (activeTab === 'timeModules') fetchTimeModules();
            if (activeTab === 'schedules') fetchAcademicSchedules();

        } catch (error) {
            console.error(error);
            addNotification('Error al sincronizar con Google Sheets', 'error');
        } finally {
            setIsSyncing(false);
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
                        icon={Clock}
                        label="Días"
                        active={activeTab === 'days'}
                        onClick={() => setActiveTab('days')}
                    />
                    <SidebarItem
                        icon={Calendar}
                        label="Bloques de Horario"
                        active={activeTab === 'timeModules'}
                        onClick={() => setActiveTab('timeModules')}
                    />

                    <SidebarItem
                        icon={FileText}
                        label="Reportes"
                        active={activeTab === 'reports'}
                        onClick={() => setActiveTab('reports')}
                    />
                </nav>

                <div className="mt-auto">
                    <SidebarItem
                        icon={Settings}
                        label="Ajustes"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col gap-6">
                <header className="flex items-center justify-between">
                    {activeTab === 'dashboard' && (
                        <div>
                            <h2 className="text-3xl font-bold">Bienvenido, Alexander</h2>
                            <p className="text-slate-400 mt-1">Gestión académica Universidad Adventista de Chile</p>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        {activeTab === 'dashboard' && (
                            <div className="relative">
                                <select
                                    value={selectedDay}
                                    onChange={(e) => setSelectedDay(e.target.value)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-900/20 appearance-none cursor-pointer pr-10 outline-none"
                                >
                                    <option value="Todos">📅 Todos los días</option>
                                    {days.map((day) => (
                                        <option key={day.id} value={day.code}>📅 {day.name}</option>
                                    ))}
                                </select>
                                <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-white pointer-events-none" />
                            </div>
                        )}
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

                        {/* Teacher List Placeholder */}
                        <div className="glass p-6">
                            <h3 className="text-lg font-bold mb-4">Plantilla Docente Actual</h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 text-sm border-b border-slate-800">
                                        <th className="pb-4 font-medium align-top">
                                            <div className="flex flex-col gap-2">
                                                <span>CODIGO DOCENTE</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={teacherColumnFilters.rut}
                                                    onChange={(e) => setTeacherColumnFilters(prev => ({ ...prev, rut: e.target.value }))}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top">
                                            <div className="flex flex-col gap-2">
                                                <span>DOCENTE</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={teacherColumnFilters.full_name}
                                                    onChange={(e) => setTeacherColumnFilters(prev => ({ ...prev, full_name: e.target.value }))}
                                                />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {teachers.length === 0 ? (
                                        <tr className="border-b border-slate-800/50">
                                            <td className="py-6 text-center text-slate-500" colSpan="3">
                                                No hay docentes registrados. Importe un archivo Excel.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTeachers.map((t) => (
                                            <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                <td className="py-3 text-slate-400 font-mono">{t.rut}</td>
                                                <td className="py-3 font-semibold">{t.full_name}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'subjects' ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold">Catálogo de Asignaturas</h2>
                                <p className="text-slate-400 mt-1">Administración de currícula y cupos por carrera</p>
                            </div>
                        </div>

                        <div className="glass p-6">
                            <h3 className="text-lg font-bold mb-4">Listado de Asignaturas</h3>

                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 text-sm border-b border-slate-800">
                                        <th className="pb-4 font-medium align-top">
                                            <div className="flex flex-col gap-2">
                                                <span>AÑO_PLAN</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={columnFilters.plan_year}
                                                    onChange={(e) => handleColumnFilterChange('plan_year', e.target.value)}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top">
                                            <div className="flex flex-col gap-2">
                                                <span>CODCARR</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={columnFilters.career_code}
                                                    onChange={(e) => handleColumnFilterChange('career_code', e.target.value)}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top">
                                            <div className="flex flex-col gap-2">
                                                <span>CARRERA</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={columnFilters.faculty}
                                                    onChange={(e) => handleColumnFilterChange('faculty', e.target.value)}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top">
                                            <div className="flex flex-col gap-2">
                                                <span>NIVEL</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={columnFilters.level}
                                                    onChange={(e) => handleColumnFilterChange('level', e.target.value)}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top">
                                            <div className="flex flex-col gap-2">
                                                <span>CODRAMO</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={columnFilters.code}
                                                    onChange={(e) => handleColumnFilterChange('code', e.target.value)}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top">
                                            <div className="flex flex-col gap-2">
                                                <span>ASIGNATURA</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={columnFilters.name}
                                                    onChange={(e) => handleColumnFilterChange('name', e.target.value)}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top">
                                            <div className="flex flex-col gap-2">
                                                <span>EQUIVALENTE</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={columnFilters.equivalent}
                                                    onChange={(e) => handleColumnFilterChange('equivalent', e.target.value)}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top">
                                            <div className="flex flex-col gap-2">
                                                <span>SECCION</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={columnFilters.section}
                                                    onChange={(e) => handleColumnFilterChange('section', e.target.value)}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top">
                                            <div className="flex flex-col gap-2">
                                                <span>CUPO</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={columnFilters.enrolled_students}
                                                    onChange={(e) => handleColumnFilterChange('enrolled_students', e.target.value)}
                                                />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredSubjects.length === 0 ? (
                                        <tr className="border-b border-slate-800/50">
                                            <td className="py-6 text-center text-slate-500" colSpan="9">
                                                No se encontraron asignaturas.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubjects.map((sub) => (
                                            <tr key={sub.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                <td className="py-3 text-slate-400">{sub.plan_year || '-'}</td>
                                                <td className="py-3 text-slate-400">{sub.career_code || '-'}</td>
                                                <td className="py-3 text-slate-400">{sub.faculty?.name || 'General'}</td>
                                                <td className="py-3 text-slate-400">{sub.level || '-'}</td>
                                                <td className="py-3 font-mono text-pink-400">{sub.code || '-'}</td>
                                                <td className="py-3 font-semibold">{sub.name}</td>
                                                <td className="py-3 text-slate-400 text-xs">{sub.equivalent || '-'}</td>
                                                <td className="py-3 text-blue-400 font-bold">{sub.section || '-'}</td>
                                                <td className="py-3 text-emerald-400 font-bold">{sub.enrolled_students}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'rooms' ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold">Módulo de Salas</h2>
                                <p className="text-slate-400 mt-1">Gestión de salas, laboratorios y aulas</p>
                            </div>
                        </div>

                        {/* Sub-tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setRoomsSubTab('listado')}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${roomsSubTab === 'listado'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'glass text-slate-400 hover:text-white border border-slate-700'
                                    }`}
                            >
                                Listado de Salas
                            </button>
                            <button
                                onClick={() => setRoomsSubTab('disponibilidad')}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${roomsSubTab === 'disponibilidad'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'glass text-slate-400 hover:text-white border border-slate-700'
                                    }`}
                            >
                                Disponibilidad Salas
                            </button>
                        </div>

                        {roomsSubTab === 'listado' ? (
                            <div className="glass p-6">
                                <h3 className="text-lg font-bold mb-4">Listado de Salas</h3>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-500 text-sm border-b border-slate-800">
                                            <th className="pb-4 font-medium align-top">
                                                <div className="flex flex-col gap-2">
                                                    <span>CODSALA</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Filtrar..."
                                                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                        value={roomColumnFilters.code}
                                                        onChange={(e) => setRoomColumnFilters(prev => ({ ...prev, code: e.target.value }))}
                                                    />
                                                </div>
                                            </th>
                                            <th className="pb-4 font-medium align-top">
                                                <div className="flex flex-col gap-2">
                                                    <span>NOMBRE</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Filtrar..."
                                                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                        value={roomColumnFilters.name}
                                                        onChange={(e) => setRoomColumnFilters(prev => ({ ...prev, name: e.target.value }))}
                                                    />
                                                </div>
                                            </th>
                                            <th className="pb-4 font-medium align-top">
                                                <div className="flex flex-col gap-2">
                                                    <span>CAPACIDAD</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Filtrar..."
                                                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                        value={roomColumnFilters.capacity}
                                                        onChange={(e) => setRoomColumnFilters(prev => ({ ...prev, capacity: e.target.value }))}
                                                    />
                                                </div>
                                            </th>
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
                                            filteredRooms.map((r) => (
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
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* Day & Module Selectors */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <select
                                            value={roomsDayFilter}
                                            onChange={(e) => setRoomsDayFilter(e.target.value)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-900/20 appearance-none cursor-pointer pr-10 outline-none"
                                        >
                                            <option value="Todos">📅 Todos los días</option>
                                            {days.map((day) => (
                                                <option key={day.id} value={day.code}>📅 {day.name}</option>
                                            ))}
                                        </select>
                                        <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-white pointer-events-none" />
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={roomsModuleFilter}
                                            onChange={(e) => setRoomsModuleFilter(e.target.value)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-900/20 appearance-none cursor-pointer pr-10 outline-none"
                                        >
                                            <option value="Todos">🕒 Todos los módulos</option>
                                            {timeModules.map((mod) => (
                                                <option key={mod.id} value={mod.mod_hor}>🕒 Módulo {mod.modulo} ({mod.rango})</option>
                                            ))}
                                        </select>
                                        <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-white pointer-events-none" />
                                    </div>
                                </div>

                                {/* Aulas A Group */}
                                {(() => {
                                    const aulasACodes = ['CCEA01', 'CCEA02', 'CCEA03', 'CCEA04', 'CCEA05', 'CCEA06', 'CCEA07', 'CCEA08', 'CCEA09', 'CCEA10', 'CCEA11', 'CCEA12', 'CCEA13', 'CCEA14', 'CCEA15', 'CCEA16', 'CCEA17', 'CCEA18'];
                                    const aulasARooms = rooms.filter(r => aulasACodes.includes(r.code));
                                    const totalModules = 13;
                                    const filteredDays = roomsDayFilter === 'Todos' ? days : days.filter(d => d.code === roomsDayFilter);
                                    const filteredSchedules = academicSchedules.filter(s =>
                                        filteredDays.some(d => d.code === s.dia) &&
                                        (roomsModuleFilter === 'Todos' || s.modulo_horario === roomsModuleFilter)
                                    );
                                    const activeModuleCount = roomsModuleFilter === 'Todos' ? totalModules : 1;

                                    // Calculate group occupancy
                                    const totalRooms = aulasARooms.length;
                                    const occupiedRooms = aulasARooms.filter(room =>
                                        filteredSchedules.some(s =>
                                            s.sala && s.sala.toUpperCase().includes(room.name.toUpperCase())
                                        )
                                    ).length;
                                    const groupPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

                                    return (
                                        <div className="glass p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold">Aulas A</h3>
                                                    <p className="text-slate-400 text-sm mt-1">{aulasARooms.length} salas registradas — {occupiedRooms}/{totalRooms} ocupadas ({groupPercentage}%)</p>
                                                </div>
                                                <div className="text-3xl font-bold">
                                                    <span className={groupPercentage > 80 ? 'text-red-400' : groupPercentage > 50 ? 'text-amber-400' : 'text-emerald-400'}>
                                                        {groupPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${groupPercentage}%` }}
                                                    className={`h-full rounded-full ${groupPercentage > 80 ? 'bg-red-500' :
                                                        groupPercentage > 50 ? 'bg-amber-500' :
                                                            'bg-emerald-500'
                                                        }`}
                                                />
                                            </div>

                                            {/* Room grid */}
                                            <div className="flex flex-col gap-3">
                                                {aulasARooms.map(room => {
                                                    const modulesUsed = filteredSchedules.filter(s =>
                                                        s.sala && s.sala.toUpperCase().includes(room.name.toUpperCase())
                                                    ).length;
                                                    const roomPercentage = Math.round((modulesUsed / (activeModuleCount * filteredDays.length)) * 100);
                                                    const isOccupied = modulesUsed > 0;

                                                    return (
                                                        <div key={room.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isOccupied ? 'bg-slate-800/40 border-slate-700/50' : 'bg-emerald-500/5 border-emerald-500/20'
                                                            }`}>
                                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${roomPercentage > 80 ? 'bg-red-500' :
                                                                roomPercentage > 50 ? 'bg-amber-500' :
                                                                    isOccupied ? 'bg-blue-500' : 'bg-emerald-500'
                                                                }`} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm font-semibold"><span className="font-mono text-blue-400">{room.code}</span> — {room.name}</span>
                                                                    <span className={`text-xs font-mono font-bold ${roomPercentage > 80 ? 'text-red-400' :
                                                                        roomPercentage > 50 ? 'text-amber-400' :
                                                                            isOccupied ? 'text-blue-400' : 'text-emerald-400'
                                                                        }`}>
                                                                        {isOccupied ? `${roomPercentage}% (${modulesUsed} mod)` : 'Libre'}
                                                                    </span>
                                                                </div>
                                                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-1.5">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${roomPercentage}%` }}
                                                                        className={`h-full rounded-full ${roomPercentage > 80 ? 'bg-red-500' :
                                                                            roomPercentage > 50 ? 'bg-amber-500' :
                                                                                isOccupied ? 'bg-blue-500' : 'bg-emerald-500'
                                                                            }`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'days' ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold">Módulo de Días</h2>
                                <p className="text-slate-400 mt-1">Configuración de días de planificación</p>
                            </div>
                        </div>

                        {/* Days List */}
                        <div className="glass p-6">
                            <h3 className="text-lg font-bold mb-4">Listado de Días</h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 text-sm border-b border-slate-800">
                                        <th className="pb-4 font-medium align-top">
                                            <span>DIA_U</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {days.length === 0 ? (
                                        <tr className="border-b border-slate-800/50">
                                            <td className="py-6 text-center text-slate-500" colSpan="1">
                                                No hay días registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        days.map((d) => (
                                            <tr key={d.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                <td className="py-3 font-semibold">{d.name}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'timeModules' ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold">Módulo de Bloques de Horario</h2>
                                <p className="text-slate-400 mt-1">Configuración de rangos horarios académicos</p>
                            </div>
                        </div>

                        <div className="glass p-6">
                            <h3 className="text-lg font-bold mb-4">Listado de Módulos Horarios</h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 text-sm border-b border-slate-800">
                                        <th className="pb-4 font-medium">MOD_HOR</th>
                                        <th className="pb-4 font-medium">HORA_INICIO</th>
                                        <th className="pb-4 font-medium">HORA_FINAL</th>
                                        <th className="pb-4 font-medium">RANGO</th>
                                        <th className="pb-4 font-medium">MÓDULO</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {timeModules.length === 0 ? (
                                        <tr className="border-b border-slate-800/50">
                                            <td className="py-6 text-center text-slate-500" colSpan="5">
                                                No hay módulos horarios registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        timeModules.map((m) => (
                                            <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                <td className="py-3 font-mono text-blue-400">{m.mod_hor}</td>
                                                <td className="py-3">{m.hora_inicio}</td>
                                                <td className="py-3">{m.hora_final}</td>
                                                <td className="py-3 text-slate-400">{m.rango}</td>
                                                <td className="py-3 font-semibold">{m.modulo}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'schedules' ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold">Visor de Horarios</h2>
                                <p className="text-slate-400 mt-1">Programación académica presencial</p>
                            </div>
                        </div>

                        <div className="glass p-6 overflow-x-auto">
                            <h3 className="text-lg font-bold mb-4">Planificación Presencial</h3>
                            <table className="w-full text-left min-w-[1000px]">
                                <thead>
                                    <tr className="text-slate-500 text-sm border-b border-slate-800">
                                        <th className="pb-4 font-medium align-top text-left px-3">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span>CARRERA</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={academicScheduleColumnFilters.carrera}
                                                    onChange={(e) => setAcademicScheduleColumnFilters({ ...academicScheduleColumnFilters, carrera: e.target.value })}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top text-center px-3">
                                            <div className="flex flex-col gap-2 items-center">
                                                <span>NIVEL</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={academicScheduleColumnFilters.nivel}
                                                    onChange={(e) => setAcademicScheduleColumnFilters({ ...academicScheduleColumnFilters, nivel: e.target.value })}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top text-left px-3">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span>DÍA</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={academicScheduleColumnFilters.dia}
                                                    onChange={(e) => setAcademicScheduleColumnFilters({ ...academicScheduleColumnFilters, dia: e.target.value })}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top text-left px-3">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span>MÓDULO Y HORARIO</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={academicScheduleColumnFilters.modulo_horario}
                                                    onChange={(e) => setAcademicScheduleColumnFilters({ ...academicScheduleColumnFilters, modulo_horario: e.target.value })}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top text-left px-3">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span>SALA</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={academicScheduleColumnFilters.sala}
                                                    onChange={(e) => setAcademicScheduleColumnFilters({ ...academicScheduleColumnFilters, sala: e.target.value })}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top text-center px-3">
                                            <div className="flex flex-col gap-2 items-center">
                                                <span>SECCIÓN</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={academicScheduleColumnFilters.seccion}
                                                    onChange={(e) => setAcademicScheduleColumnFilters({ ...academicScheduleColumnFilters, seccion: e.target.value })}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top text-left px-3">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span>CODRAMO</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={academicScheduleColumnFilters.codramo}
                                                    onChange={(e) => setAcademicScheduleColumnFilters({ ...academicScheduleColumnFilters, codramo: e.target.value })}
                                                />
                                            </div>
                                        </th>
                                        <th className="pb-4 font-medium align-top text-left px-3">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span>ASIGNATURA</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={academicScheduleColumnFilters.asignatura}
                                                    onChange={(e) => setAcademicScheduleColumnFilters({ ...academicScheduleColumnFilters, asignatura: e.target.value })}
                                                />
                                            </div>
                                        </th>

                                        <th className="pb-4 font-medium align-top text-left px-3">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span>DOCENTE</span>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-full focus:outline-none focus:border-blue-500"
                                                    value={academicScheduleColumnFilters.docente}
                                                    onChange={(e) => setAcademicScheduleColumnFilters({ ...academicScheduleColumnFilters, docente: e.target.value })}
                                                />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredAcademicSchedules.length === 0 ? (
                                        <tr className="border-b border-slate-800/50">
                                            <td className="py-6 text-center text-slate-500" colSpan="9">

                                                No hay horarios registrados.
                                            </td>

                                        </tr>
                                    ) : (
                                        filteredAcademicSchedules.map((s) => (
                                            <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                <td className="py-3 px-3 text-xs text-blue-400 font-mono">{s.carrera}</td>
                                                <td className="py-3 px-3 text-center">{s.nivel}</td>
                                                <td className="py-3 px-3">{s.dia}</td>
                                                <td className="py-3 px-3 text-xs font-mono">{s.modulo_horario}</td>
                                                <td className="py-3 px-3 text-xs">{s.sala}</td>

                                                <td className="py-3 px-3 text-center font-bold">{s.seccion}</td>
                                                <td className="py-3 px-3 font-mono text-xs text-slate-400">{s.codramo}</td>
                                                <td className="py-3 px-3">{s.asignatura}</td>
                                                <td className="py-3 px-3 italic text-slate-300">{s.docente}</td>
                                            </tr>

                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold">Ajustes</h2>
                                <p className="text-slate-400 mt-1">Configuración general y herramientas del sistema</p>
                            </div>
                        </div>

                        <div className="glass p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
                                    <FileText size={20} />
                                </div>
                                Integraciones
                            </h3>

                            <div className="border border-slate-700 rounded-xl p-4 bg-slate-900/50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-blue-400">Google Sheets</h4>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Sincronizar Docentes, Facultades y Asignaturas desde la hoja de cálculo maestra.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleSyncGoogleSheets}
                                        disabled={isSyncing}
                                        className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${isSyncing
                                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-500 text-slate-950 shadow-lg shadow-green-900/20'
                                            }`}
                                    >
                                        <div className={`${isSyncing ? 'animate-spin' : ''}`}>
                                            <CheckCircle2 size={18} />
                                        </div>
                                        {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                                    </button>
                                </div>
                            </div>
                        </div>
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

                            <div className="flex flex-col gap-6">
                                <div className="glass p-6 flex flex-col gap-6">
                                    <h3 className="text-xl font-bold">Disponibilidad Salas</h3>
                                    <div className="flex flex-col gap-4">
                                        {[
                                            { name: 'Aulas Generales', usage: 72 },
                                            { name: 'Salas de Reunión', usage: 40 },
                                            { name: 'Auditorios', usage: 55 },
                                            { name: 'Canchas', usage: 20 }
                                        ].map((sala) => (
                                            <div key={sala.name} className="flex flex-col gap-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">{sala.name}</span>
                                                    <span className="font-bold">{sala.usage}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${sala.usage}%` }}
                                                        className={`h-full ${sala.usage > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
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
                        </div>
                    </>
                )
                }
            </main >
        </div >
    );
}
