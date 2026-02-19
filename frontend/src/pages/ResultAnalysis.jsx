import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { CheckCircle, XCircle, BookOpen, Target, ArrowRight, Calendar, AlertTriangle } from 'lucide-react';

const ResultAnalysis = () => {
    const { attemptId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 3;

        const fetchResult = async () => {
            try {
                const { data } = await api.get(`/test/result/${attemptId}`);
                setResult(data);
                setError('');
            } catch (err) {
                // Retry mechanism for race conditions (result not saved yet)
                if (err.response?.status === 404 && retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Result not found, retrying... (${retryCount}/${maxRetries})`);
                    setTimeout(fetchResult, 1000);
                    return;
                }
                setError(err.response?.data?.message || 'Failed to load result');
            } finally {
                if (retryCount === 0 || retryCount >= maxRetries) {
                    setLoading(false);
                }
            }
        };

        fetchResult();
    }, [attemptId]);

    if (loading) return <div className="min-h-screen bg-bg-dark flex items-center justify-center">Loading Result...</div>;

    if (error || !result) return (
        <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center gap-4">
            <AlertTriangle size={48} className="text-danger" />
            <div className="text-danger text-lg">{error || 'Result not found'}</div>
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-dark">
            <Navbar />
            <div className="container mt-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-2">Test Results</h1>
                    <div className="text-dim">Attempted on {new Date(result.createdAt).toLocaleDateString()}</div>
                </div>

                {/* Score Card */}
                <div className="card mb-8 flex flex-col md:flex-row items-center justify-around text-center gap-6">
                    <div>
                        <div className="text-5xl font-bold text-primary mb-2">{result.percentage?.toFixed(0)}%</div>
                        <div className="text-dim">Overall Score</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-2">{result.score} / {result.totalQuestions || result.questions?.length || 0}</div>
                        <div className="text-dim">Correct Answers</div>
                    </div>
                    <div>
                        <div className={`text-2xl font-bold mb-2 ${result.percentage >= 60 ? 'text-success' : 'text-danger'}`}>
                            {result.percentage >= 60 ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                        </div>
                        <div className="text-dim">Status</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Topic Analysis */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Target size={20} /> Topic Analysis</h3>
                        <div className="flex flex-col gap-4">
                            {result.topicStats && Object.entries(result.topicStats).map(([topic, stats]) => {
                                const percent = (stats.correct / stats.total) * 100;
                                return (
                                    <div key={topic}>
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">{topic}</span>
                                            <span className={`${percent < 60 ? 'text-danger' : 'text-success'}`}>
                                                {percent.toFixed(0)}% ({stats.correct}/{stats.total})
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${percent < 60 ? 'bg-danger' : 'bg-success'}`}
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BookOpen size={20} /> AI Study Plan</h3>

                        {result.recommendation ? (
                            <div className="flex flex-col gap-6">
                                {/* Weak Areas */}
                                {result.recommendation.weakAreas && result.recommendation.weakAreas.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-danger mb-2">⚠️ Weak Areas</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.recommendation.weakAreas.map((area, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-danger/10 border border-danger/30 rounded-full text-sm text-danger">
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 7-Day Study Plan */}
                                {result.recommendation.studyPlan && result.recommendation.studyPlan.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-1"><Calendar size={14} /> 7-Day Plan</h4>
                                        <div className="flex flex-col gap-2">
                                            {result.recommendation.studyPlan.map((item, idx) => (
                                                <div key={idx} className="bg-bg-dark p-3 rounded border border-gray-700">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">Day {item.day || idx + 1}</span>
                                                        <span className="font-medium text-sm">{item.focus}</span>
                                                    </div>
                                                    <p className="text-xs text-dim ml-14">{item.tasks}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {result.recommendation.recommendations && result.recommendation.recommendations.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-success mb-2">💡 Recommendations</h4>
                                        <ul className="flex flex-col gap-2">
                                            {result.recommendation.recommendations.map((rec, idx) => (
                                                <li key={idx} className="bg-bg-dark p-3 rounded border border-gray-700 flex items-start gap-3">
                                                    <ArrowRight size={16} className="text-primary mt-0.5 shrink-0" />
                                                    <span className="text-sm">{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-dim">No specific recommendations generated.</div>
                        )}
                    </div>

                </div>

                {/* Detailed Review */}
                <h3 className="text-xl font-bold mt-10 mb-6">Detailed Answer Review</h3>
                <div className="flex flex-col gap-6 mb-12">
                    {result.questions && result.questions.map((q, idx) => (
                        <div key={idx} className={`card border-l-4 ${q.userAnswer === q.correctAnswer ? 'border-l-success' : 'border-l-danger'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-medium text-lg flex-1">
                                    <span className="text-dim mr-2">{idx + 1}.</span> {q.question}
                                </h4>
                                {q.userAnswer === q.correctAnswer ?
                                    <CheckCircle className="text-success shrink-0" size={24} /> :
                                    <XCircle className="text-danger shrink-0" size={24} />
                                }
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                                <div className={`p-3 rounded border ${q.userAnswer === q.correctAnswer ? 'bg-success/10 border-success text-success' : 'bg-danger/10 border-danger text-danger'
                                    }`}>
                                    <div className="font-bold mb-1">Your Answer:</div>
                                    {q.userAnswer || <i>Skipped</i>}
                                </div>

                                <div className="p-3 rounded border bg-gray-700/30 border-gray-600 text-gray-300">
                                    <div className="font-bold mb-1">Correct Answer:</div>
                                    {q.correctAnswer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mb-12">
                    <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
                </div>

            </div>
        </div>
    );
};

export default ResultAnalysis;
