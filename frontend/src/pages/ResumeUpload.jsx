import { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader, UploadCloud } from 'lucide-react';

const ResumeUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a resume (PDF)');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const { data } = await api.post('/test/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Navigate to test start page (using testId)
            // Wait we don't have a specific "Start Screen" separate from "Test Interface"? 
            // Usually user clicks "Start" on a screen that shows details.
            // Let's navigate to /test/:testId
            navigate(`/test/${data.testId}`);

        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-dark">
            <Navbar />
            <div className="container flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="card w-full max-w-lg text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <UploadCloud size={32} />
                    </div>

                    <h1 className="text-2xl font-bold mb-2">Upload Your Resume</h1>
                    <p className="text-dim mb-8">
                        Our AI will analyze your resume and generate a personalized mock interview test for you.
                    </p>

                    <form onSubmit={handleUpload} className="flex flex-col gap-6">
                        <div className={`border-2 border-dashed rounded-xl p-8 transition-colors ${file ? 'border-primary bg-primary/5' : 'border-gray-700 hover:border-gray-500'}`}>
                            <input
                                type="file"
                                id="resume"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label htmlFor="resume" className="cursor-pointer flex flex-col items-center gap-2">
                                <FileText size={24} className={file ? 'text-primary' : 'text-dim'} />
                                <span className={file ? 'text-white font-medium' : 'text-dim'}>
                                    {file ? file.name : 'Click to select PDF'}
                                </span>
                            </label>
                        </div>

                        {error && <div className="text-danger text-sm">{error}</div>}

                        <button
                            type="submit"
                            className="btn btn-primary w-full py-4 text-lg"
                            disabled={loading}
                        >
                            {loading ? <><Loader className="animate-spin" /> Generating Test...</> : 'Generate Interview'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResumeUpload;
