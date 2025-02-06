'use client'
import { useState } from "react";
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
    } catch (error) {
      console.error('Error generating letter:', error);
      alert('Failed to generate letter. Please try again.');
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
          <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Motivation Letter Generator
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Generate a tailored motivation letter for your job application
          </p>

          {/* Job Application Link Section */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Job Application Details</h2>
            <textarea
              value={jobDetails}
              onChange={(e) => setJobDetails(e.target.value)}
              placeholder="Paste the job posting URL here"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              rows={10}
            />
            <p className="text-gray-400 mt-2 text-sm">
              Add the link to the job posting to tailor your motivation letter
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Your Profile</h2>
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
            <div className="prose prose-invert max-w-none">
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