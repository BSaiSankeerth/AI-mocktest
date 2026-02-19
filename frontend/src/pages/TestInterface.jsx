import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const TestInterface = () => {
    const { testId } = useParams();
    const navigate = useNavigate();

    const [testData, setTestData] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    // Submit handler
    const submitTest = useCallback(async () => {
        if (submitting || !testData) return;
        setSubmitting(true);

        try {
            const answersArray = testData.questions.map((_, index) => answers[index] || null);

            const { data } = await api.post(`/test/submit/${testData.attemptId}`, {
                answers: answersArray
            });

            // Use attemptId from response (guaranteed by backend)
            const resultAttemptId = data.attemptId || testData.attemptId;
            navigate(`/result/${resultAttemptId}`, { replace: true });

        } catch (err) {
            const msg = err.response?.data?.message || 'Submission failed';
            // If already submitted, navigate to result
            if (err.response?.status === 400 && msg.includes('already submitted')) {
                navigate(`/result/${testData.attemptId}`, { replace: true });
                return;
            }
            setError(msg);
            setSubmitting(false);
        }
    }, [answers, navigate, submitting, testData]);

    // Fetch test data on mount
    useEffect(() => {
        const fetchTest = async () => {
            try {
                const { data } = await api.get(`/test/start/${testId}`);
                setTestData(data);

                const durationSec = data.duration * 60;
                const elapsedSec = (new Date() - new Date(data.startedAt)) / 1000;
                const remaining = Math.max(0, durationSec - elapsedSec);

                setTimeLeft(remaining);

                if (remaining <= 0) {
                    setError("Test time has expired");
                }

            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load test');
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId]);

    // Timer countdown
    useEffect(() => {
        if (!testData || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, testData, submitTest]);

    const handleAnswer = (option) => {
        setAnswers({ ...answers, [currentQuestion]: option });
    };

    if (loading) return <div className="min-h-screen bg-bg-dark flex items-center justify-center">Loading Test...</div>;
    if (error) return (
        <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center gap-4">
            <div className="text-danger text-lg">{error}</div>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Go to Dashboard</button>
        </div>
    );

    const question = testData.questions[currentQuestion];
    const totalQuestions = testData.questions.length;

    return (
        <div className="min-h-screen bg-bg-dark">
            <div className="bg-bg-card border-b border-gray-800 p-4 sticky top-0 z-10">
                <div className="container flex justify-between items-center">
                    <h2 className="text-xl font-bold">Mock Interview Test</h2>
                    <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-danger animate-pulse' : 'text-primary'}`}>
                        <Clock size={24} /> {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="container mt-8 max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-dim">Question {currentQuestion + 1} of {totalQuestions}</span>
                    <span className={`text-xs px-2 py-1 rounded border ${question.difficulty === 'hard' ? 'border-red-500 text-red-500' :
                        question.difficulty === 'medium' ? 'border-yellow-500 text-yellow-500' :
                            'border-green-500 text-green-500'
                        }`}>
                        {question.difficulty}
                    </span>
                </div>

                <div className="card mb-8">
                    <h3 className="text-lg font-medium mb-6">{question.question}</h3>

                    <div className="flex flex-col gap-3">
                        {question.options && question.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option)}
                                className={`p-4 rounded-lg text-left border transition-all ${answers[currentQuestion] === option
                                    ? 'bg-primary/20 border-primary text-white'
                                    : 'bg-bg-dark border-gray-700 hover:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[currentQuestion] === option ? 'border-primary bg-primary' : 'border-gray-500'
                                        }`}>
                                        {answers[currentQuestion] === option && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    {option}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <button
                        className="btn bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                    >
                        <ChevronLeft size={20} /> Previous
                    </button>

                    {currentQuestion === totalQuestions - 1 ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => submitTest()}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Test'} <CheckCircle size={20} />
                        </button>
                    ) : (
                        <button
                            className="btn bg-gray-700 hover:bg-gray-600"
                            onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
                        >
                            Next <ChevronRight size={20} />
                        </button>
                    )}
                </div>

                {/* Pagination Dots */}
                <div className="flex flex-wrap gap-2 mt-8 justify-center">
                    {testData.questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentQuestion(idx)}
                            className={`w-3 h-3 rounded-full ${idx === currentQuestion ? 'bg-primary' :
                                answers[idx] ? 'bg-success' : 'bg-gray-700'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestInterface;
