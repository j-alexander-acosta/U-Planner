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

const StatCard = ({ label, value, trend, icon: Icon, trendColor, onShowAll }) => (
    <div className="glass p-6 flex items-center justify-between">
        <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            <span className={`${trendColor || 'text-emerald-400'} text-xs font-semibold`}>{trend}</span>
            {onShowAll && (
                <button onClick={onShowAll} className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center">
                    Ver todo <ChevronRight size={16} className="ml-1" />
                </button>
            )}
        </div>
        <div className="bg-slate-800 p-3 rounded-xl">
            <Icon className="text-blue-400" size={24} />
        </div>
    </div>
);

export default function App({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notifications, setNotifications] = useState([]);
    const [selectedDay, setSelectedDay] = useState('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [conflictDetails, setConflictDetails] = useState([]);
    const [roomsSubTab, setRoomsSubTab] = useState('listado');
    const [roomsDayFilter, setRoomsDayFilter] = useState('Todos');
    const [roomsModuleFilter, setRoomsModuleFilter] = useState('Todos');
    const [roomsGroupFilter, setRoomsGroupFilter] = useState('Todos');
    const [dashGroupFilter, setDashGroupFilter] = useState('Todos');
    const [dashDayFilter, setDashDayFilter] = useState('Todos');
    const [dashModuleFilter, setDashModuleFilter] = useState('Todos');
    const [suggestionsSearchTerm, setSuggestionsSearchTerm] = useState('');
    const [sugColFilters, setSugColFilters] = useState({ asignatura: '', docente: '', sala: '', estado: '' });
    const [conflictsSearchTerm, setConflictsSearchTerm] = useState('');
    const [confColFilters, setConfColFilters] = useState({ type: '', entity: '', subject: '', day: '' });
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
        if (activeTab === 'dashboard') {
            fetchTeachers();
            fetchRooms();
            fetchSubjects();
            fetchAcademicSchedules();
            fetchDays();
            fetchTimeModules();
        }
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

    // Calculate Active Teachers dynamically based on Dashboard filters
    const activeDashDays = dashDayFilter === 'Todos' ? days : days.filter(d => d.code === dashDayFilter);
    const activeSchedulesForTeachers = academicSchedules.filter(s =>
        activeDashDays.some(d => d.code === s.dia) &&
        (dashModuleFilter === 'Todos' || s.modulo_horario === dashModuleFilter)
    );
    const targetDashRooms = dashGroupFilter === 'Todos'
        ? rooms
        : rooms.filter(r => r.code.startsWith(dashGroupFilter));
    const fullyFilteredSchedules = activeSchedulesForTeachers.filter(s =>
        targetDashRooms.some(r => s.sala && s.sala.toUpperCase().includes(r.name.toUpperCase()))
    );
    const activeTeachersCount = new Set(fullyFilteredSchedules.map(s => s.docente).filter(Boolean)).size;

    const occupiedDashRoomsCount = targetDashRooms.filter(room =>
        fullyFilteredSchedules.some(s =>
            s.sala && s.sala.toUpperCase().includes(room.name.toUpperCase())
        )
    ).length;
    const totalDashRoomsCount = targetDashRooms.length;
    const dashRoomsPercentage = totalDashRoomsCount > 0 ? Math.round((occupiedDashRoomsCount / totalDashRoomsCount) * 100) : 0;

    const activeSubjectsCount = new Set(fullyFilteredSchedules.map(s => s.codramo || s.asignatura).filter(Boolean)).size;

    let localConflicts = [];
    const scheduleGroups = {};
    activeSchedulesForTeachers.forEach(s => {
        if (!s.dia || !s.modulo_horario) return;
        const key = `${s.dia}-${s.modulo_horario}`;
        if (!scheduleGroups[key]) scheduleGroups[key] = [];
        scheduleGroups[key].push(s);
    });

    Object.values(scheduleGroups).forEach(group => {
        if (group.length <= 1) return;
        const roomsInSlot = new Map();
        const teachersInSlot = new Map();
        group.forEach(s => {
            if (s.sala && typeof s.sala === 'string' && s.sala.trim() !== '') {
                const roomKey = s.sala.toUpperCase().trim();
                let isAdhoc = roomKey.includes("A DETERMINAR") || roomKey.includes("POR ASIGNAR");
                if (!isAdhoc) {
                    if (roomsInSlot.has(roomKey)) {
                        localConflicts.push({
                            type: 'Cruce de Sala',
                            entity: roomKey,
                            subject: s.asignatura || s.codramo,
                            day: s.dia,
                            module: s.modulo_horario
                        });
                        // Add the original conflicting schedule if it's the first time we detect the conflict for this room
                        const original = roomsInSlot.get(roomKey);
                        if (original && !original.reported) {
                            localConflicts.push({
                                type: 'Cruce de Sala',
                                entity: roomKey,
                                subject: original.asignatura || original.codramo,
                                day: original.dia,
                                module: original.modulo_horario
                            });
                            original.reported = true;
                        }

                    } else {
                        roomsInSlot.set(roomKey, s);
                    }
                }
            }
            if (s.docente && typeof s.docente === 'string' && s.docente.trim() !== '') {
                const teacherKey = s.docente.toUpperCase().trim();
                let isNoDocente = teacherKey.includes("POR ASIGNAR") || teacherKey === "SIN DOCENTE" || teacherKey === "NO ASIGNADO";
                if (!isNoDocente) {
                    if (teachersInSlot.has(teacherKey)) {
                        localConflicts.push({
                            type: 'Cruce de Docente',
                            entity: teacherKey,
                            subject: s.asignatura || s.codramo,
                            day: s.dia,
                            module: s.modulo_horario
                        });
                        const original = teachersInSlot.get(teacherKey);
                        if (original && !original.reportedTeacher) {
                            localConflicts.push({
                                type: 'Cruce de Docente',
                                entity: teacherKey,
                                subject: original.asignatura || original.codramo,
                                day: original.dia,
                                module: original.modulo_horario
                            });
                            original.reportedTeacher = true;
                        }
                    } else {
                        teachersInSlot.set(teacherKey, s);
                    }
                }
            }
        });
    });

    // update state only if different to prevent infinite loops (using a simple length check or stringify if needed, but in standard react this should be set in a useEffect. Since this is derived state calculated during render, it's better to just use the local variable for rendering the modal to avoid infinite loops, but we need the modal to access it. So we set it in a useEffect.)
    const conflictsCount = localConflicts.length;

    useEffect(() => {
        setConflictDetails(localConflicts);
    }, [academicSchedules, selectedDay, dashDayFilter, dashModuleFilter, dashGroupFilter]);

    const suggestedAssignments = [];
    activeSchedulesForTeachers.forEach(s => {
        const subject = subjects.find(sub =>
            sub.code === s.codramo || sub.name === s.asignatura
        );
        const enrolled = subject ? (parseInt(subject.enrolled_students) || 0) : 0;

        let assignedRoom = targetDashRooms.find(r => s.sala && s.sala.toUpperCase().includes(r.name.toUpperCase()));

        if (assignedRoom && parseInt(assignedRoom.capacity) >= enrolled) {
            suggestedAssignments.push({
                asignatura: subject ? subject.name : s.asignatura,
                docente: s.docente || 'Sin Docente',
                sala: `${assignedRoom.name} (${enrolled}/${assignedRoom.capacity})`,
                estado: 'Confirmado'
            });
        } else if (assignedRoom && parseInt(assignedRoom.capacity) < enrolled) {
            let betterRoom = targetDashRooms.find(r => parseInt(r.capacity) >= enrolled);
            suggestedAssignments.push({
                asignatura: subject ? subject.name : s.asignatura,
                docente: s.docente || 'Sin Docente',
                sala: betterRoom ? `${betterRoom.name} (${enrolled}/${betterRoom.capacity})` : `${assignedRoom.name} (Capacidad: ${assignedRoom.capacity}, Cupo: ${enrolled})`,
                estado: betterRoom ? 'Sugerido' : 'Sobrecupo'
            });
        } else if (!assignedRoom) {
            let suitableRoom = targetDashRooms.find(r => parseInt(r.capacity) >= enrolled);
            if (suitableRoom) {
                suggestedAssignments.push({
                    asignatura: subject ? subject.name : s.asignatura,
                    docente: s.docente || 'Sin Docente',
                    sala: `${suitableRoom.name} (${enrolled}/${suitableRoom.capacity})`,
                    estado: 'Sugerido'
                });
            }
        }
    });

    const uniqueSuggestions = [];
    const seenSugs = new Set();
    for (let sug of suggestedAssignments) {
        let key = `${sug.asignatura}-${sug.docente}-${sug.sala}-${sug.estado}`;
        if (!seenSugs.has(key)) {
            seenSugs.add(key);
            uniqueSuggestions.push(sug);
        }
    }
    const topSuggestions = uniqueSuggestions.length > 0 ? uniqueSuggestions.slice(0, 6) : [];

    const queryParams = new URLSearchParams(window.location.search);
    const viewMode = queryParams.get('view');

    if (viewMode === 'suggestions') {
        const lowerSearch = suggestionsSearchTerm.toLowerCase();
        const filteredSuggestions = uniqueSuggestions.filter(sug => {
            const matchGlobal = (sug.asignatura?.toLowerCase() || '').includes(lowerSearch) ||
                (sug.docente?.toLowerCase() || '').includes(lowerSearch) ||
                (sug.sala?.toLowerCase() || '').includes(lowerSearch) ||
                (sug.estado?.toLowerCase() || '').includes(lowerSearch);

            const matchCols =
                (sug.asignatura?.toLowerCase() || '').includes(sugColFilters.asignatura.toLowerCase()) &&
                (sug.docente?.toLowerCase() || '').includes(sugColFilters.docente.toLowerCase()) &&
                (sug.sala?.toLowerCase() || '').includes(sugColFilters.sala.toLowerCase()) &&
                (sug.estado?.toLowerCase() || '').includes(sugColFilters.estado.toLowerCase());

            return matchGlobal && matchCols;
        });

        return (
            <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans flex flex-col items-center">
                <div className="w-full max-w-5xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Todas las Asignaciones Sugeridas</h2>
                            <p className="text-slate-400 text-sm mt-1">Sugerencias basadas en la capacidad de las salas y cupos.</p>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar asignatura, docente, sala..."
                                value={suggestionsSearchTerm}
                                onChange={(e) => setSuggestionsSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>

                    <div className="glass overflow-hidden rounded-xl border border-slate-700/50">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-800/80 sticky top-0 z-10 backdrop-blur-md">
                                <tr className="text-slate-300 text-sm">
                                    <th className="p-4 font-semibold border-b border-slate-700/50 align-top">
                                        <div className="flex flex-col gap-2">
                                            <span>Asignatura</span>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                                placeholder="Filtrar..."
                                                value={sugColFilters.asignatura}
                                                onChange={(e) => setSugColFilters({ ...sugColFilters, asignatura: e.target.value })}
                                            />
                                        </div>
                                    </th>
                                    <th className="p-4 font-semibold border-b border-slate-700/50 align-top">
                                        <div className="flex flex-col gap-2">
                                            <span>Docente</span>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                                placeholder="Filtrar..."
                                                value={sugColFilters.docente}
                                                onChange={(e) => setSugColFilters({ ...sugColFilters, docente: e.target.value })}
                                            />
                                        </div>
                                    </th>
                                    <th className="p-4 font-semibold border-b border-slate-700/50 align-top">
                                        <div className="flex flex-col gap-2">
                                            <span>Sala</span>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                                placeholder="Filtrar..."
                                                value={sugColFilters.sala}
                                                onChange={(e) => setSugColFilters({ ...sugColFilters, sala: e.target.value })}
                                            />
                                        </div>
                                    </th>
                                    <th className="p-4 font-semibold border-b border-slate-700/50 text-center align-top">
                                        <div className="flex flex-col gap-2 items-center">
                                            <span>Estado</span>
                                            <input
                                                type="text"
                                                className="w-full max-w-[100px] bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-center"
                                                placeholder="Filtrar..."
                                                value={sugColFilters.estado}
                                                onChange={(e) => setSugColFilters({ ...sugColFilters, estado: e.target.value })}
                                            />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredSuggestions.length === 0 ? (
                                    <tr>
                                        <td className="p-8 text-center text-slate-500 font-medium bg-slate-800/30" colSpan="4">
                                            {uniqueSuggestions.length === 0 ? "No hay sugerencias disponibles con los filtros actuales." : "No se encontraron sugerencias que coincidan con la búsqueda."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSuggestions.map((sug, i) => (
                                        <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4 font-medium text-slate-200">{sug.asignatura}</td>
                                            <td className="p-4 text-slate-400">{sug.docente}</td>
                                            <td className="p-4 text-slate-400">{sug.sala}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold border ${sug.estado === 'Confirmado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                    sug.estado === 'Sugerido' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                                        'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                                    }`}>
                                                    {sug.estado === 'Confirmado' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></span>}
                                                    {sug.estado === 'Sugerido' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span>}
                                                    {sug.estado === 'Sobrecupo' && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-2"></span>}
                                                    {sug.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'conflicts') {
        const lowerSearch = conflictsSearchTerm.toLowerCase();
        const filteredConflicts = conflictDetails.filter(conflict => {
            const matchGlobal = (conflict.type?.toLowerCase() || '').includes(lowerSearch) ||
                (conflict.entity?.toLowerCase() || '').includes(lowerSearch) ||
                (conflict.subject?.toLowerCase() || '').includes(lowerSearch) ||
                (conflict.day?.toLowerCase() || '').includes(lowerSearch) ||
                (String(conflict.module)?.toLowerCase() || '').includes(lowerSearch);

            const matchCols =
                (conflict.type?.toLowerCase() || '').includes(confColFilters.type.toLowerCase()) &&
                (conflict.entity?.toLowerCase() || '').includes(confColFilters.entity.toLowerCase()) &&
                (conflict.subject?.toLowerCase() || '').includes(confColFilters.subject.toLowerCase()) &&
                ((conflict.day?.toLowerCase() || '').includes(confColFilters.day.toLowerCase()) ||
                    (String(conflict.module)?.toLowerCase() || '').includes(confColFilters.day.toLowerCase()));

            return matchGlobal && matchCols;
        });

        return (
            <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans flex flex-col items-center">
                <div className="w-full max-w-5xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 text-left">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#fb7185' }}>
                                <AlertCircle size={24} />
                                Detalles de Conflictos de Horario
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Lista de asignaturas que tienen cruces de salas o docentes simultáneos.</p>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar asignatura, sala, módulo..."
                                value={conflictsSearchTerm}
                                onChange={(e) => setConflictsSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
                            />
                        </div>
                    </div>

                    <div className="glass overflow-hidden rounded-xl w-full border border-slate-700/50 bg-slate-900/50 text-left">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-800/80 sticky top-0 z-10 backdrop-blur-md">
                                <tr className="text-slate-300 text-sm">
                                    <th className="p-4 font-semibold border-b border-slate-700/50 rounded-tl-xl text-center align-top">
                                        <div className="flex flex-col gap-2 items-center">
                                            <span>TIPO DE CRUCE</span>
                                            <input
                                                type="text"
                                                className="w-full max-w-[120px] bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500/50 text-center"
                                                placeholder="Filtrar..."
                                                value={confColFilters.type}
                                                onChange={(e) => setConfColFilters({ ...confColFilters, type: e.target.value })}
                                            />
                                        </div>
                                    </th>
                                    <th className="p-4 font-semibold border-b border-slate-700/50 align-top">
                                        <div className="flex flex-col gap-2">
                                            <span>SALA / DOCENTE EN CRUCE</span>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                                                placeholder="Filtrar..."
                                                value={confColFilters.entity}
                                                onChange={(e) => setConfColFilters({ ...confColFilters, entity: e.target.value })}
                                            />
                                        </div>
                                    </th>
                                    <th className="p-4 font-semibold border-b border-slate-700/50 align-top">
                                        <div className="flex flex-col gap-2">
                                            <span>ASIGNATURA AFECTADA</span>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                                                placeholder="Filtrar..."
                                                value={confColFilters.subject}
                                                onChange={(e) => setConfColFilters({ ...confColFilters, subject: e.target.value })}
                                            />
                                        </div>
                                    </th>
                                    <th className="p-4 font-semibold border-b border-slate-700/50 text-center align-top">
                                        <div className="flex flex-col gap-2 items-center">
                                            <span>HORARIO DEL CONFLICTO</span>
                                            <input
                                                type="text"
                                                className="w-full max-w-[150px] bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500/50 text-center"
                                                placeholder="Filtrar..."
                                                value={confColFilters.day}
                                                onChange={(e) => setConfColFilters({ ...confColFilters, day: e.target.value })}
                                            />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredConflicts.length === 0 ? (
                                    <tr>
                                        <td className="p-8 text-center text-slate-500 font-medium bg-slate-800/30" colSpan="4">
                                            {conflictDetails.length === 0 ? "No hay conflictos registrados en los horarios seleccionados." : "No se encontraron conflictos que coincidan con la búsqueda."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredConflicts.map((conflict, i) => (
                                        <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4 font-bold text-center">
                                                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${conflict.type === 'Cruce de Sala' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                                                    {conflict.type === 'Cruce de Sala' ? <DoorOpen size={14} className="mr-1" /> : <Users size={14} className="mr-1" />}
                                                    {conflict.type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-200 font-medium">{conflict.entity}</td>
                                            <td className="p-4 text-slate-300 font-semibold">{conflict.subject}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-indigo-400 font-bold">{conflict.day}</span>
                                                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 mt-1 rounded-md">Módulo {conflict.module}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

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
                        className="bg-slate-700/80 border border-slate-600 text-sm font-medium p-2.5 rounded-lg text-white outline-none cursor-pointer hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-blue-500/50"
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

                {/* User Profile in Sidebar Bottom */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-0.5 shrink-0">
                        {user?.picture ? (
                            <img src={user.picture} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-slate-900" referrerPolicy="no-referrer" />
                        ) : (
                            <div className="w-full h-full rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                                <Users size={16} className="text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'Usuario'}</p>
                        <button
                            onClick={onLogout}
                            className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors text-left"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
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
                            <div className="flex flex-col gap-4">
                                {[
                                    { prefix: 'CCEA', label: 'Aulas A' },
                                    { prefix: 'CCEB', label: 'Aulas B' },
                                    { prefix: 'CCEC', label: 'Aulas C' },
                                    { prefix: 'CCED', label: 'Aulas D' },
                                    { prefix: 'CCEE', label: 'Aulas E' },
                                    { prefix: 'CCEF', label: 'Aulas F' },
                                ].map(group => {
                                    const groupRooms = filteredRooms.filter(r => r.code.startsWith(group.prefix));
                                    if (groupRooms.length === 0) return null;
                                    return (
                                        <div key={group.prefix} className="glass p-6">
                                            <h3 className="text-lg font-bold mb-1">{group.label}</h3>
                                            <p className="text-slate-400 text-sm mb-4">{groupRooms.length} salas</p>
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-slate-500 text-sm border-b border-slate-800">
                                                        <th className="pb-3 font-medium">CODSALA</th>
                                                        <th className="pb-3 font-medium">NOMBRE</th>
                                                        <th className="pb-3 font-medium">CAPACIDAD</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {groupRooms.map((r) => (
                                                        <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                            <td className="py-3 font-mono text-blue-400">{r.code}</td>
                                                            <td className="py-3 font-semibold">{r.name}</td>
                                                            <td className="py-3 text-slate-400">{r.capacity}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })}
                                {/* Salas sin grupo */}
                                {(() => {
                                    const knownPrefixes = ['CCEA', 'CCEB', 'CCEC', 'CCED', 'CCEE', 'CCEF'];
                                    const ungrouped = filteredRooms.filter(r => !knownPrefixes.some(p => r.code.startsWith(p)));
                                    if (ungrouped.length === 0) return null;
                                    return (
                                        <div className="glass p-6">
                                            <h3 className="text-lg font-bold mb-1">Otras Salas</h3>
                                            <p className="text-slate-400 text-sm mb-4">{ungrouped.length} salas</p>
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-slate-500 text-sm border-b border-slate-800">
                                                        <th className="pb-3 font-medium">CODSALA</th>
                                                        <th className="pb-3 font-medium">NOMBRE</th>
                                                        <th className="pb-3 font-medium">CAPACIDAD</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {ungrouped.map((r) => (
                                                        <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                            <td className="py-3 font-mono text-blue-400">{r.code}</td>
                                                            <td className="py-3 font-semibold">{r.name}</td>
                                                            <td className="py-3 text-slate-400">{r.capacity}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* Filters Row */}
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="relative">
                                        <select
                                            value={roomsGroupFilter}
                                            onChange={(e) => setRoomsGroupFilter(e.target.value)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-900/20 appearance-none cursor-pointer pr-10 outline-none"
                                        >
                                            <option value="Todos">🏢 Todos los grupos</option>
                                            <option value="CCEA">🏢 Aulas A</option>
                                            <option value="CCEB">🏢 Aulas B</option>
                                            <option value="CCEC">🏢 Aulas C</option>
                                            <option value="CCED">🏢 Aulas D</option>
                                            <option value="CCEE">🏢 Aulas E</option>
                                            <option value="CCEF">🏢 Aulas F</option>
                                        </select>
                                        <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-white pointer-events-none" />
                                    </div>
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

                                {/* Room Groups */}
                                {[
                                    { prefix: 'CCEA', label: 'Aulas A' },
                                    { prefix: 'CCEB', label: 'Aulas B' },
                                    { prefix: 'CCEC', label: 'Aulas C' },
                                    { prefix: 'CCED', label: 'Aulas D' },
                                    { prefix: 'CCEE', label: 'Aulas E' },
                                    { prefix: 'CCEF', label: 'Aulas F' },
                                ].filter(g => roomsGroupFilter === 'Todos' || roomsGroupFilter === g.prefix).map(group => {
                                    const groupRooms = rooms.filter(r => r.code.startsWith(group.prefix));
                                    const totalModules = 13;
                                    const filteredDays = roomsDayFilter === 'Todos' ? days : days.filter(d => d.code === roomsDayFilter);
                                    const filteredSchedules = academicSchedules.filter(s =>
                                        filteredDays.some(d => d.code === s.dia) &&
                                        (roomsModuleFilter === 'Todos' || s.modulo_horario === roomsModuleFilter)
                                    );
                                    const activeModuleCount = roomsModuleFilter === 'Todos' ? totalModules : 1;

                                    const totalRooms = groupRooms.length;
                                    const occupiedRooms = groupRooms.filter(room =>
                                        filteredSchedules.some(s =>
                                            s.sala && s.sala.toUpperCase().includes(room.name.toUpperCase())
                                        )
                                    ).length;
                                    const groupPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

                                    return (
                                        <div key={group.prefix} className="glass p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold">{group.label}</h3>
                                                    <p className="text-slate-400 text-sm mt-1">{groupRooms.length} salas registradas — {occupiedRooms}/{totalRooms} ocupadas ({groupPercentage}%)</p>
                                                </div>
                                                <div className="text-3xl font-bold">
                                                    <span style={{ color: groupPercentage > 80 ? '#8b5cf6' : groupPercentage > 50 ? '#f59e0b' : '#10b981' }}>
                                                        {groupPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ height: '10px' }} className="w-full bg-slate-800 rounded-full overflow-hidden mb-6">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${groupPercentage}%` }}
                                                    style={{ height: '100%', borderRadius: '9999px', backgroundColor: groupPercentage > 80 ? '#8b5cf6' : groupPercentage > 50 ? '#f59e0b' : '#10b981' }}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                {groupRooms.map(room => {
                                                    const modulesUsed = filteredSchedules.filter(s =>
                                                        s.sala && s.sala.toUpperCase().includes(room.name.toUpperCase())
                                                    ).length;
                                                    const roomPercentage = Math.round((modulesUsed / (activeModuleCount * filteredDays.length)) * 100);
                                                    const isOccupied = modulesUsed > 0;

                                                    return (
                                                        <div key={room.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isOccupied ? 'bg-slate-800/40 border-slate-700/50' : 'bg-emerald-500/5 border-emerald-500/20'
                                                            }`}>
                                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, backgroundColor: roomPercentage > 80 ? '#8b5cf6' : roomPercentage > 50 ? '#f59e0b' : isOccupied ? '#3b82f6' : '#10b981' }} />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm font-semibold"><span className="font-mono text-blue-400">{room.code}</span> — {room.name}</span>
                                                                    <span style={{ color: roomPercentage > 80 ? '#8b5cf6' : roomPercentage > 50 ? '#f59e0b' : isOccupied ? '#3b82f6' : '#10b981' }} className="text-xs font-mono font-bold">
                                                                        {isOccupied ? `${roomPercentage}% (${modulesUsed} mod)` : 'Libre'}
                                                                    </span>
                                                                </div>
                                                                <div style={{ height: '8px' }} className="w-full bg-slate-700/50 rounded-full overflow-hidden mt-2">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${roomPercentage}%` }}
                                                                        style={{ height: '100%', borderRadius: '9999px', backgroundColor: roomPercentage > 80 ? '#8b5cf6' : roomPercentage > 50 ? '#f59e0b' : isOccupied ? '#3b82f6' : '#10b981' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
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
                    <DirectorDashboard schedules={academicSchedules} />
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
                            <StatCard label="Total Docentes" value={`${activeTeachersCount} / ${teachers.length}`} trend="Activos / Total" icon={Users} />
                            <StatCard label="Salas Ocupadas" value={`${occupiedDashRoomsCount}/${totalDashRoomsCount}`} trend={`${dashRoomsPercentage}% capacidad`} icon={DoorOpen} />
                            <StatCard label="Asignaturas" value={`${activeSubjectsCount} / ${subjects.length}`} trend="Programadas / Total" icon={BookOpen} />
                            <StatCard
                                label="Conflictos"
                                value={conflictsCount.toString()}
                                trend={conflictsCount > 0 ? "Requiere atención" : "Optimizado"}
                                trendColor={conflictsCount > 0 ? "text-rose-400" : "text-emerald-400"}
                                icon={Calendar}
                                onShowAll={conflictsCount > 0 ? () => window.open('?view=conflicts', '_blank') : null}
                            />
                        </section>

                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 glass p-6 overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold">Asignaciones Sugeridas</h3>
                                    <button
                                        className="text-blue-400 text-sm font-semibold flex items-center gap-1 hover:text-blue-300 transition-colors"
                                        onClick={() => window.open('?view=suggestions', '_blank')}
                                    >
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
                                            {topSuggestions.length === 0 ? (
                                                <tr className="border-b border-slate-800/50">
                                                    <td className="py-6 text-center text-slate-500 font-medium" colSpan="4">
                                                        No hay sugerencias con los filtros actuales
                                                    </td>
                                                </tr>
                                            ) : (
                                                topSuggestions.map((sug, i) => (
                                                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                                                        <td className="py-4 font-semibold">{sug.asignatura}</td>
                                                        <td className="py-4 text-slate-400">{sug.docente}</td>
                                                        <td className="py-4 text-slate-400">{sug.sala}</td>
                                                        <td className="py-4">
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${sug.estado === 'Confirmado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                sug.estado === 'Sugerido' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                }`}>
                                                                {sug.estado}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="glass p-6 flex flex-col gap-6">
                                    <h3 className="text-xl font-bold">Disponibilidad Salas</h3>
                                    <div className="flex flex-col gap-2">
                                        <div className="relative">
                                            <select
                                                value={dashGroupFilter}
                                                onChange={(e) => setDashGroupFilter(e.target.value)}
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-900/20 appearance-none cursor-pointer pr-10 outline-none"
                                            >
                                                <option value="Todos">🏢 Todos los grupos</option>
                                                <option value="CCEA">🏢 Aulas A</option>
                                                <option value="CCEB">🏢 Aulas B</option>
                                                <option value="CCEC">🏢 Aulas C</option>
                                                <option value="CCED">🏢 Aulas D</option>
                                                <option value="CCEE">🏢 Aulas E</option>
                                                <option value="CCEF">🏢 Aulas F</option>
                                            </select>
                                            <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-white pointer-events-none" />
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={dashDayFilter}
                                                onChange={(e) => setDashDayFilter(e.target.value)}
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-900/20 appearance-none cursor-pointer pr-10 outline-none"
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
                                                value={dashModuleFilter}
                                                onChange={(e) => setDashModuleFilter(e.target.value)}
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-900/20 appearance-none cursor-pointer pr-10 outline-none"
                                            >
                                                <option value="Todos">🕒 Todos los módulos</option>
                                                {timeModules.map((mod) => (
                                                    <option key={mod.id} value={mod.mod_hor}>🕒 Módulo {mod.modulo} ({mod.rango})</option>
                                                ))}
                                            </select>
                                            <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-white pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {[
                                            { prefix: 'CCEA', label: 'Aulas A' },
                                            { prefix: 'CCEB', label: 'Aulas B' },
                                            { prefix: 'CCEC', label: 'Aulas C' },
                                            { prefix: 'CCED', label: 'Aulas D' },
                                            { prefix: 'CCEE', label: 'Aulas E' },
                                            { prefix: 'CCEF', label: 'Aulas F' },
                                        ].filter(g => dashGroupFilter === 'Todos' || dashGroupFilter === g.prefix).map((group) => {
                                            const groupRooms = rooms.filter(r => r.code.startsWith(group.prefix));
                                            const filteredDays = dashDayFilter === 'Todos' ? days : days.filter(d => d.code === dashDayFilter);
                                            const filteredSchedules = academicSchedules.filter(s =>
                                                filteredDays.some(d => d.code === s.dia) &&
                                                (dashModuleFilter === 'Todos' || s.modulo_horario === dashModuleFilter)
                                            );
                                            const totalRooms = groupRooms.length;
                                            const occupiedRooms = groupRooms.filter(room =>
                                                filteredSchedules.some(s =>
                                                    s.sala && s.sala.toUpperCase().includes(room.name.toUpperCase())
                                                )
                                            ).length;
                                            const availableRooms = groupRooms.filter(room =>
                                                !filteredSchedules.some(s =>
                                                    s.sala && s.sala.toUpperCase().includes(room.name.toUpperCase())
                                                )
                                            );
                                            const usage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

                                            return (
                                                <div key={group.prefix} className="flex flex-col gap-2 mb-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-400">{group.label} ({occupiedRooms}/{totalRooms})</span>
                                                        <span className="font-bold">{usage}%</span>
                                                    </div>
                                                    <div style={{ height: '8px' }} className="w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${usage}%` }}
                                                            style={{ height: '100%', borderRadius: '9999px', backgroundColor: usage > 80 ? '#8b5cf6' : usage > 50 ? '#f59e0b' : '#10b981' }}
                                                        />
                                                    </div>
                                                    {availableRooms.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {availableRooms.map(r => (
                                                                <span key={r.id} className="text-xs font-medium px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                                                    {r.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </>
                )}


            </main >
        </div >
    );
}
