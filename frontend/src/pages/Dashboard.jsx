import { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Activity, BarChart2, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
};

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const { data } = await api.get('/test/dashboard');
                setStats(data);
                setError('');
            } catch (err) {
                console.error("Failed to fetch dashboard", err);
                setError(err.response?.data?.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) return <div className="min-h-screen bg-bg-dark text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-bg-dark">
            <Navbar />
            <div className="container mt-8">
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="text-3xl font-bold">Performance Overview</h1>
                </motion.div>

                {error && (
                    <div className="card mb-6 flex items-center gap-3 text-danger">
                        <AlertTriangle size={20} /> {error}
                    </div>
                )}

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="card flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                            <Activity size={32} />
                        </div>
                        <div>
                            <p className="text-dim text-sm">Total Attempts</p>
                            <h3 className="text-2xl font-bold">{stats?.totalAttempts || 0}</h3>
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="card flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-full text-green-500">
                            <BarChart2 size={32} />
                        </div>
                        <div>
                            <p className="text-dim text-sm">Average Score</p>
                            <h3 className="text-2xl font-bold">
                                {stats?.avgPercentage || 0}%
                            </h3>
                        </div>
                    </motion.div>
                </motion.div>

                <h2 className="text-xl font-semibold mb-4 text-dim">Recent History</h2>
                <motion.div
                    className="flex flex-col gap-4"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    {stats?.attempts?.map((attempt, index) => (
                        <motion.div
                            key={attempt._id}
                            variants={fadeUp}
                            transition={{ duration: 0.35, delay: index * 0.05 }}
                            className="card flex justify-between items-center p-4 hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex flex-col">
                                <span className="font-semibold text-white">Mock Test Attempt</span>
                                <span className="text-xs text-dim flex items-center gap-1">
                                    <Clock size={12} /> {new Date(attempt.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-sm font-bold text-primary">{attempt.score ?? '-'} pts</div>
                                    <div className={`text-xs ${(attempt.percentage || 0) >= 60 ? 'text-success' : 'text-danger'}`}>
                                        {attempt.percentage != null ? `${attempt.percentage.toFixed(0)}%` : '-'}
                                    </div>
                                </div>
                                <Link to={`/result/${attempt._id}`} className="btn btn-primary text-sm">
                                    View Result
                                </Link>
                            </div>
                        </motion.div>
                    ))}

                    {(!stats?.attempts || stats.attempts.length === 0) && (
                        <div className="text-center py-12 text-dim">
                            No attempts yet. <Link to="/upload" className="text-primary underline">Start your first test!</Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
