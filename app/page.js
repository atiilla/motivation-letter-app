'use client'
import { useState } from "react";
import Swal from 'sweetalert2';
export default function Home() {
  const [language, setLanguage] = useState('');
  const [fileName, setFileName] = useState('');
  const [jobDetails, setJobDetails] = useState('');
  const [profile, setProfile] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleJobDetailsChange = (e) => {
    setJobDetails(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };


  const handleClipboardChange = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(generatedLetter);
    Swal.fire({
      title: 'Motivation letter copied to clipboard',
      icon: 'success',
    });
  }


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      try {
        const text = await handleFileUploadAndExtractText(file);
        setProfile(text.text);
      } catch (error) {
        console.error('Error processing PDF:', error);
      }
    }
  };

  const handleGenerate = async () => {
    if (!jobDetails || !language || !profile) {
      alert('Please fill in all fields and upload a PDF');
      return;
    }

    const prompt = `
    You are a professional resume writer.
    You are given a job posting and a profile.
    You need to write a motivation letter for the profile to the job posting.
    The job posting is: ${jobDetails}
    The profile is: ${profile}
    The language is: ${language}
    `
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user", 
              content: prompt
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate letter');
      }

      const data = await response.json();
      setGeneratedLetter(data.content);
      setIsModalOpen(true);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating letter:', error);
      alert('Failed to generate letter. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleFileUploadAndExtractText = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/readpdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to process PDF');
    }

    const data = await response.json();
    return data;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Motivation Letter Generator
          </h1>
          <p className="text-gray-400 text-center mb-2">
            Generate a motivation letter for your job application based on your CV and the job posting
          </p>
          
          {/* GitHub Follow Section */}
          <div className="rounded-lg p-2 mb-6">
            <div className="flex items-center justify-center space-x-3">
              <a
                href="https://github.com/atiilla"
                target="_blank"
                rel="noopener noreferrer" 
                className="flex items-center px-4 py-2 bg-[#24292e] hover:bg-[#2f363d] rounded-md transition-colors text-white"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Follow me on GitHub
              </a>
            </div>
          </div>

          {/* Job Application Link Section */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Job Application Details</h2>
            <textarea
              value={jobDetails}
              onChange={(e) => setJobDetails(e.target.value)}
              placeholder="Paste the job"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              rows={10}
            />
            <p className="text-gray-400 mt-2 text-sm">
              Paste the job details here
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Your CV</h2>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                id="file-upload"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Choose PDF File
              </label>
              {fileName && (
                <p className="text-gray-300 mt-2">Selected file: {fileName}</p>
              )}
              <p className="text-gray-400 mt-2 text-sm">
                Upload your CV/Resume in PDF format
              </p>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Select Language</h2>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a language</option>
              <option value="English">English</option>
              <option value="Turkish">Turkish</option>
              <option value="French">French</option>
              <option value="Dutch">Dutch</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
          >
            {isGenerating ? 'Generating...' : 'Generate Motivation Letter'}
          </button>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Generated Motivation Letter</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="prose prose-invert max-w-none" onClick={handleClipboardChange}>
              <pre className="whitespace-pre-wrap">{generatedLetter}</pre>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}