import React, { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    Calendar,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

const SummaryCard = ({ label, value, icon: Icon, color }) => (
    <div className="glass p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start">
            <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
                <Icon size={20} />
            </div>
            <TrendingUp size={16} className="text-emerald-400" />
        </div>
        <div>
            <p className="text-slate-400 text-sm">{label}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
    </div>
);

export default function DirectorDashboard({ schedules = [] }) {
    // Extraer carreras únicas de los horarios académicos, ignorando valores vacíos o nulos
    const uniqueCareers = Array.from(new Set(
        schedules
            .map(s => s.carrera)
            .filter(c => c && c.trim() !== '')
    )).sort();

    // Si no hay carreras en los datos, usar un placeholder
    const carreras = uniqueCareers.length > 0 ? uniqueCareers : ['Cargando carreras...'];
    const [selectedCarrera, setSelectedCarrera] = useState(carreras[0]);

    useEffect(() => {
        if (!carreras.includes(selectedCarrera) || selectedCarrera === 'Cargando carreras...') {
            setSelectedCarrera(carreras[0]);
        }
    }, [uniqueCareers.join(',')]);

    // Filtrar los horarios en base a la carrera seleccionada
    const filteredSchedules = schedules.filter(s => s.carrera === selectedCarrera);

    // Calcular métricas dinámicas
    const activeSubjects = new Set(filteredSchedules.map(s => s.asignatura).filter(Boolean)).size;
    const activeTeachers = new Set(filteredSchedules.map(s => s.docente).filter(d => d && d.toUpperCase() !== 'POR DEFINIR' && d.trim() !== '')).size;
    // Asumiremos que cada módulo corresponde a un bloque de horas. Para simplificar, total de entradas = total horas/bloques
    // Frecuentemente en universidades de Chile 1 módulo = 1.5 horas cronológicas o 2 pedagógicas. Contaremos los módulos totales.
    const totalHours = filteredSchedules.filter(s => s.modulo_horario).length * 1.5;

    // Determinar Conflictos (simplificado: mismo docente, mismo día y mismo bloque en la carrera)
    // Para simplificar, si hay 2 entradas con el mismo docente, día y módulo, es conflicto.
    const conflicts = new Set();
    const scheduleKeys = new Set();
    filteredSchedules.forEach(s => {
        if (s.docente && s.docente.toUpperCase() !== 'POR DEFINIR' && s.dia && s.modulo_horario) {
            const key = `${s.docente}-${s.dia}-${s.modulo_horario}`;
            if (scheduleKeys.has(key)) {
                conflicts.add(key);
            } else {
                scheduleKeys.add(key);
            }
        }
    });
    const pendingConflicts = conflicts.size;

    const departmentalLoad = [
        { day: 'Lun', hours: filteredSchedules.filter(s => s.dia && s.dia.includes('Lunes')).length * 1.5 || 0 },
        { day: 'Mar', hours: filteredSchedules.filter(s => s.dia && s.dia.includes('Martes')).length * 1.5 || 0 },
        { day: 'Mie', hours: filteredSchedules.filter(s => s.dia && s.dia.includes('Miércoles')).length * 1.5 || 0 },
        { day: 'Jue', hours: filteredSchedules.filter(s => s.dia && s.dia.includes('Jueves')).length * 1.5 || 0 },
        { day: 'Vie', hours: filteredSchedules.filter(s => s.dia && s.dia.includes('Viernes')).length * 1.5 || 0 },
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold">Panel de Director</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <select
                            value={selectedCarrera}
                            onChange={(e) => setSelectedCarrera(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-sm p-2 rounded-lg text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer w-[300px]"
                        >
                            {carreras.map(carrera => (
                                <option key={carrera} value={carrera}>{carrera}</option>
                            ))}
                        </select>
                        <p className="text-slate-400 text-sm">
                            • Semestre Actual
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <span className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-600/20">
                        Modo Revisión Activo
                    </span>
                </div>
            </div>

            {/* Career Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard label="Asignaturas Activas" value={activeSubjects.toString()} icon={BookOpen} color="blue" />
                <SummaryCard label="Docentes Desplegados" value={activeTeachers.toString()} icon={Users} color="emerald" />
                <SummaryCard label="Horas Semanales" value={`${totalHours}h`} icon={Clock} color="purple" />
                <SummaryCard label="Conflictos Pendientes" value={pendingConflicts.toString()} icon={AlertTriangle} color={pendingConflicts > 0 ? "red" : "emerald"} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Schedule Review Table */}
                <div className="lg:col-span-2 glass p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Resumen de Asignaciones ({filteredSchedules.length})</h3>
                        <div className="flex gap-2">
                            <button className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
                                Exportar PDF
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-[300px]">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-slate-900">
                                <tr className="text-slate-500 text-sm border-b border-slate-800">
                                    <th className="pb-4 font-medium">Asignatura</th>
                                    <th className="pb-4 font-medium">Docente</th>
                                    <th className="pb-4 font-medium">Bloque</th>
                                    <th className="pb-4 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredSchedules.slice(0, 50).map((row, idx) => {
                                    const isConflict = row.docente && row.docente.toUpperCase() !== 'POR DEFINIR' &&
                                        conflicts.has(`${row.docente}-${row.dia}-${row.modulo_horario}`);
                                    return (
                                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                            <td className="py-4 font-semibold">{row.asignatura || 'Sin Asignatura'}</td>
                                            <td className="py-4 text-slate-400">{row.docente || 'Por Definir'}</td>
                                            <td className="py-4 text-slate-400">{row.dia} {row.modulo_horario}</td>
                                            <td className="py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${isConflict ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                    {isConflict ? 'Conflicto' : 'Aprobado'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Weekly Load Chart Visual */}
                <div className="glass p-6 flex flex-col gap-6">
                    <h3 className="text-xl font-bold">Carga Semanal</h3>
                    <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2">
                        {departmentalLoad.map((data, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-3">
                                <div className="text-xs text-slate-500 font-medium">{data.hours}h</div>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.min(data.hours * 2, 100)}px` }}
                                    className="w-full bg-gradient-to-t from-blue-600/40 to-blue-400 rounded-t-lg relative group"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {data.hours} horas
                                    </div>
                                </motion.div>
                                <span className="text-xs font-bold text-slate-400 uppercase">{data.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                        <span>Horas cronológicas estimadas</span>
                    </div>
                </div>
            </div>

            {/* Teacher Load Indicators */}
            <div className="glass p-6">
                <h3 className="text-xl font-bold mb-6">Estado de Plantilla Docente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { name: 'Dr. Alan Turing', load: 85, status: 'Carga Alta' },
                        { name: 'Msc. Grace Hopper', load: 60, status: 'Balanceado' },
                        { name: 'Dr. John McCarthy', load: 30, status: 'Disponible' }
                    ].map((prof, idx) => (
                        <div key={idx} className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">{prof.name}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${prof.load > 80 ? 'text-red-400' : 'text-slate-500'}`}>
                                    {prof.status}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${prof.load > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${prof.load}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500">
                                <span>0h</span>
                                <span>{prof.load}% de carga</span>
                                <span>40h</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
