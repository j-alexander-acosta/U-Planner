import React from 'react';
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

export default function DirectorDashboard() {
    const departmentalLoad = [
        { day: 'Lun', hours: 12 },
        { day: 'Mar', hours: 15 },
        { day: 'Mie', hours: 10 },
        { day: 'Jue', hours: 14 },
        { day: 'Vie', hours: 8 },
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold">Panel de Director</h2>
                    <p className="text-slate-400 mt-1">Ingeniería Civil Informática • Primer Semestre 2026</p>
                </div>
                <div className="flex gap-3">
                    <span className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-600/20">
                        Modo Revisión Activo
                    </span>
                </div>
            </div>

            {/* Career Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard label="Asignaturas Activas" value="86" icon={BookOpen} color="blue" />
                <SummaryCard label="Docentes Desplegados" value="42" icon={Users} color="emerald" />
                <SummaryCard label="Horas Semanales" value="156h" icon={Clock} color="purple" />
                <SummaryCard label="Conflictos Pendientes" value="3" icon={AlertTriangle} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Schedule Review Table */}
                <div className="lg:col-span-2 glass p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Revisión de Horarios Propuestos</h3>
                        <div className="flex gap-2">
                            <button className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
                                Exportar PDF
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-500 text-sm border-b border-slate-800">
                                    <th className="pb-4 font-medium">Asignatura</th>
                                    <th className="pb-4 font-medium">Docente</th>
                                    <th className="pb-4 font-medium">Bloque</th>
                                    <th className="pb-4 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    { sub: 'Sistemas Operativos', prof: 'Dr. Alan Turing', time: 'Lun 08:00', status: 'Aprobado', color: 'emerald' },
                                    { sub: 'Base de Datos II', prof: 'Msc. Grace Hopper', time: 'Mar 10:00', status: 'Pendiente', color: 'blue' },
                                    { sub: 'IA Avanzada', prof: 'Dr. John McCarthy', time: 'Mie 14:00', status: 'Corregir', color: 'red' },
                                    { sub: 'Redes de Datos', prof: 'Ing. Vint Cerf', time: 'Jue 11:30', status: 'Aprobado', color: 'emerald' },
                                    { sub: 'Ética Profesional', prof: 'Lic. Ada Lovelace', time: 'Vie 09:45', status: 'Aprobado', color: 'emerald' },
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                        <td className="py-4 font-semibold">{row.sub}</td>
                                        <td className="py-4 text-slate-400">{row.prof}</td>
                                        <td className="py-4 text-slate-400">{row.time}</td>
                                        <td className="py-4">
                                            <span className={`bg-${row.color}-500/10 text-${row.color}-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-${row.color}-500/20`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
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
                                    animate={{ height: `${data.hours * 8}px` }}
                                    className="w-full bg-gradient-to-t from-blue-600/40 to-blue-400 rounded-t-lg relative group"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {data.hours} horas
                                    </div>
                                </motion.div>
                                <span className="text-xs font-bold text-slate-400 uppercase">{data.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                        <span>Máx: 20h diarios</span>
                        <span className="text-emerald-400 font-bold">Optimizado</span>
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
