import React, { useState, useEffect } from 'react';
import { Download, Filter, FileText, ChevronRight } from 'lucide-react';
import axios from 'axios';

export default function Reports() {
    const [faculties, setFaculties] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFaculties = async () => {
            try {
                const response = await axios.get('/api/faculties/');
                setFaculties(response.data);
            } catch (err) {
                console.error("Error fetching faculties", err);
            }
        };
        fetchFaculties();
    }, []);

    const handleFetchReport = async () => {
        if (!selectedFaculty) return;
        setLoading(true);
        try {
            const response = await axios.get(`/api/reports/schedules/faculty/${selectedFaculty}`);
            setReportData(response.data);
        } catch (err) {
            console.error("Error fetching report", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!selectedFaculty) return;
        window.location.href = `/api/reports/export/faculty/${selectedFaculty}`;
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold">Módulo de Reportes</h2>
                    <p className="text-slate-400 mt-1">Generación y exportación de horarios por facultad</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass p-6 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Seleccionar Facultad</label>
                    <select
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                        className="bg-slate-800 border-none text-sm p-3 rounded-lg text-slate-300 outline-none w-64"
                    >
                        <option value="">Seleccione una facultad...</option>
                        {faculties.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleFetchReport}
                    disabled={!selectedFaculty || loading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold transition-all"
                >
                    <Filter size={20} />
                    {loading ? 'Cargando...' : 'Generar Vista Previa'}
                </button>

                <button
                    onClick={handleExport}
                    disabled={!selectedFaculty}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold transition-all"
                >
                    <Download size={20} />
                    Exportar CSV
                </button>
            </div>

            {/* Report Preview */}
            <div className="glass p-6 min-h-[400px]">
                {selectedFaculty && reportData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-500 text-sm border-b border-slate-800">
                                    <th className="pb-4 font-medium">Asignatura</th>
                                    <th className="pb-4 font-medium">Docente</th>
                                    <th className="pb-4 font-medium">Sala</th>
                                    <th className="pb-4 font-medium">Día / Bloque</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {reportData.map((s) => (
                                    <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                        <td className="py-4 font-semibold">{s.subject_id} {/* Ideally we'd have name here if nested */} </td>
                                        <td className="py-4 text-slate-400">ID: {s.teacher_id}</td>
                                        <td className="py-4 text-slate-400">ID: {s.room_id}</td>
                                        <td className="py-4 text-slate-400">ID: {s.time_block_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500">
                        <FileText size={48} strokeWidth={1} className="mb-4 opacity-20" />
                        <p>Seleccione una facultad y haga clic en "Generar Vista Previa" para ver los datos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
