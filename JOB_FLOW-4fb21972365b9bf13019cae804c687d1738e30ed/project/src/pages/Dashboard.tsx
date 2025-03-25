import React, { useState } from 'react';
import { Phone, Send, Upload, FileText , Download} from 'lucide-react';

interface Results {
  jobPost: string;
  jd: string;
  resume: string;
}

interface FormData {
  job_title: string;
  location: string;
  exp: string;
  salary_range: string;
  other_input: string;
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState('jobPost');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Results>({
    jobPost: '',
    jd: '',
    resume: ''
  });
  const [tableData, setTableData] = useState<any[]>([]);

  const apiUrl = "https://recruitment-385388557268.asia-south2.run.app";

  const handleJobPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData: FormData = {
      job_title: (form.querySelector('#jobTitle') as HTMLInputElement).value,
      location: (form.querySelector('#location') as HTMLInputElement).value,
      exp: (form.querySelector('#experience') as HTMLInputElement).value,
      salary_range: (form.querySelector('#salaryRange') as HTMLInputElement).value,
      other_input: (form.querySelector('#additionalDetails') as HTMLTextAreaElement).value,
    };

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/job_post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const result = await response.json();

      const content = result.content || result;
      const formattedContent = formatJobPost(content);
      setResults(prev => ({
        ...prev,
        jobPost: formattedContent
      }));
    } catch (error) {
      console.error("Error:", error);
      setResults(prev => ({
        ...prev,
        jobPost: `<div class="text-red-400">Error: ${error}. Check console for details.</div>`
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const formatJobPost = (content: string) => {
    // Clean up the content
    content = content.replace(/\*+/g, "").trim();
    
    // Extract title if it exists at the beginning
    const titleMatch = content.match(/^([^\n]+)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : "Job Posting";
    
    // Create sections by identifying common headings
    let formattedContent = content
      // Transform headings - ensure title text is white
      .replace(/^(.*?)(?:(\n|^)(About the Role:|Job Description:|Overview:))/si, 
        "<h1 class='text-3xl font-bold text-white mb-6'>$1</h1><h2 class='text-2xl font-semibold text-purple-400 mb-4'>$3</h2>")
      // Handle case where there's a specific "Job Title:" prefix
      .replace(/(?:\n|^)(Job Title:)([^\n]+)/gi, 
        "<h1 class='text-3xl font-bold text-white mb-6'>$1$2</h1>")
      .replace(/(?:\n|^)(What We're Looking For:|Requirements:|Qualifications:|Skills Required:)/gi, 
        "<h2 class='text-2xl font-semibold text-purple-400 mt-8 mb-4'>$1</h2>")
      .replace(/(?:\n|^)(Benefits:|Perks:|What We Offer:|Compensation & Benefits:)/gi, 
        "<h2 class='text-2xl font-semibold text-purple-400 mt-8 mb-4'>$1</h2>")
      .replace(/(?:\n|^)(To Apply:|Application Process:|Next Steps:|How to Apply:)/gi, 
        "<h2 class='text-2xl font-semibold text-purple-400 mt-8 mb-4'>$1</h2>")
      
      // Handle bullet points with better spacing and icons
      .replace(/\n\s*•\s*/g, '</p><li class="flex items-start mb-3"><span class="text-purple-400 mr-2">•</span><span class="text-gray-300">')
      .replace(/\n\s*-\s*/g, '</p><li class="flex items-start mb-3"><span class="text-purple-400 mr-2">•</span><span class="text-gray-300">')
      
      // Handle paragraphs with proper spacing
      .replace(/\n\n+/g, '</p><p class="text-gray-300 mb-6">')
      .replace(/\n/g, '</p><p class="text-gray-300 mb-4">')
      
      // Convert square-bracketed terms to better-looking tags
      .replace(/\[([^\]]+)\]/g, '<span class="inline-block bg-purple-500/20 text-purple-200 px-3 py-1 rounded-md text-sm mr-2 mb-2 shadow-sm hover:bg-purple-500/30 transition-colors">$1</span>')
      
      // Add emphasis to important terms
      .replace(/(bonus|remote work|flexible hours|work from home|competitive salary)/gi, 
               '<span class="text-purple-300 font-medium">$1</span>')
      
      // Handle emojis with animation
      .replace(/🚀/g, '<span class="inline-block text-purple-400 transform hover:scale-110 transition-transform duration-200">🚀</span>')
      .replace(/💡/g, '<span class="inline-block text-yellow-400 transform hover:scale-110 transition-transform duration-200">💡</span>')
      .replace(/⭐/g, '<span class="inline-block text-yellow-400 transform hover:scale-110 transition-transform duration-200">⭐</span>')
      
      // Clean up any empty paragraphs
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<li class="flex items-start mb-3"><span class="text-purple-400 mr-2">•<\/span><span class="text-gray-300"><\/span><\/li>/g, '');
  
    // Wrap bullet points in proper ul tags
    formattedContent = formattedContent.replace(
      /(<li class="flex items-start mb-3">.*?<\/li>)+/g,
      match => `<ul class="list-none ml-4 my-4">${match}</ul>`
    );
  
    // Ensure all spans in list items are closed
    formattedContent = formattedContent.replace(
      /<span class="text-gray-300">([^<]*?)(?=<\/li>|<li|$)/g,
      '<span class="text-gray-300">$1</span>'
    );
  
    // Apply final wrapper with better styling - removed submit application button
    return `
      <div class="job-post bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-xl p-8 border border-purple-500/10 mt-6 shadow-xl transition-all hover:shadow-purple-500/5">
        <div class="prose prose-invert max-w-none">
          ${formattedContent}
        </div>
        <div class="mt-8 border-t border-white/10 pt-6">
          <p class="text-gray-400 text-sm">Interested candidates, please follow the application instructions above.</p>
        </div>
      </div>
    `;
  };
  
const formatJobDescription = (jobData: any) => {
  const { job_title, job_location, job_description } = jobData;
  
  // Clean up the job description for consistent formatting
  let cleanedDescription = job_description
    // Fix inconsistent numbering format in lists
    .replace(/(\n\d+)\.\s+/g, '\n$1. ') // Ensure consistent spacing after numbers
    .replace(/\n1\./g, '\n1.') // Handle special case for first item
    .replace(/\n\n(\d+\.)/g, '\n$1'); // Fix extra line breaks before numbered items
  
  // Format the job description text with better styling
  let formattedDescription = cleanedDescription
    // Format section headers with more prominent styling
    .replace(/([A-Za-z\s]+:)\s*\n/g, '<h4 class="text-xl font-semibold text-purple-300 mt-6 mb-3">$1</h4>')
    // Format numbered lists with better spacing and visual hierarchy
    .replace(/\n(\d+\.)\s+([^\n]+)/g, '<li class="ml-5 mb-4 flex"><span class="text-purple-400 mr-3 font-medium">$1</span><span class="text-gray-300">$2</span></li>')
    // Handle paragraphs
    .replace(/\n\n/g, '</p><p class="text-gray-300 mb-4">')
    // Handle single line breaks within paragraphs
    .replace(/\n(?!\n)/g, '<br />');

  // Wrap lists in proper ul tags with better styling
  formattedDescription = formattedDescription.replace(
    /(<li class="ml-5 mb-4 flex">.*?<\/li>)+/g,
    match => `<ul class="list-none my-5 space-y-3">${match}</ul>`
  );
  
  // Highlight important skills and qualifications with more emphasis
  formattedDescription = formattedDescription.replace(
    /(communication|interpersonal|teamwork|leadership|management|excel|proficient|knowledge|experience|skills|recruitment|sourcing|screening|interviews|onboarding|engagement)/gi,
    '<span class="text-purple-200 font-medium">$1</span>'
  );
  
  return `
    <div class="job-description bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-xl p-8 border border-purple-500/10 mt-6 shadow-xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-white/10">
        <h2 class="text-3xl font-bold text-white mb-2 sm:mb-0">${job_title || 'Job Title'}</h2>
        ${job_location ? `
          <div class="flex items-center bg-purple-500/10 px-4 py-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-purple-300 font-medium">${job_location}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="prose prose-invert max-w-none">
        <p class="text-gray-300">${formattedDescription}</p>
      </div>
      
      <div class="mt-8 pt-4 border-t border-white/10">
        <button class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-colors flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Apply for this position
        </button>
      </div>
    </div>
  `;
};
    

  const handleFileUpload = async (e: React.FormEvent, endpoint: string) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData();
  
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert('Please select a file');
      setIsLoading(false);
      return;
    }
  
    // File field name based on the endpoint
    if (endpoint === 'process-resumes') {
      Array.from(fileInput.files).forEach((file) => {
        formData.append('files', file);
      });
    } else {
      formData.append('file', fileInput.files[0]);
    }
  
    try {
      const response = await fetch(`${apiUrl}/${endpoint}`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
  
      if (endpoint === 'process-resumes') {
        setResults(prev => ({
          ...prev,
          resume: jsonToTable(result)
        }));
      } else {
        // Display a simple success message instead of the formatted job description
        const jobTitle = result.job_title || "Job";
        setResults(prev => ({
          ...prev,
          jd: `
            <div class="mt-6 p-8 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/30 flex items-center">
              <div class="bg-green-500/20 p-3 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-medium text-green-400">Success!</h3>
                <p class="text-gray-300">Job description for "${jobTitle}" extracted successfully.</p>
              </div>
            </div>
          `
        }));
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setIsLoading(false);
      form.reset();
    }
  };

  const downloadAsCSV = (jsonData: any[]) => {
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      alert('No data available to download');
      return;
    }
    
    const columns = Object.keys(jsonData[0]);
    const header = columns.join(',');
    const csvRows = jsonData.map(row => 
      columns.map(col => {
        // Format the value and handle special characters
        const value = row[col] === null || row[col] === undefined ? '' : row[col];
        const formatted = String(value).replace(/"/g, '""');
        return `"${formatted}"`;
      }).join(',')
    );
    
    const csvContent = [header, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'resume_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

const jsonToTable = (jsonData: any[]) => {
  // Save the data for download
  setTableData(jsonData);
  
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    return `
      <div class="text-center p-10 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg mt-6">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-purple-300">No data available</h3>
        <p class="mt-1 text-sm text-gray-400">Try uploading a different file or adjusting your search parameters.</p>
      </div>
    `;
  }

  const columns = Object.keys(jsonData[0]);
  const isNumeric = (val: any) => !isNaN(parseFloat(val)) && isFinite(val);

  // Function to format cell data based on content type
  const formatCellContent = (value: any, col: string, rowIndex: number) => {
    if (value === null || value === undefined) return '-';
    
    // Special handling for phone number columns
    if (col.toLowerCase().includes('phone') || col.toLowerCase().includes('number') || col.toLowerCase().includes('contact')) {
      const phoneNumber = String(value).replace(/\D/g, '');
      return `
        <div class="relative group">
          <span class="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors">
            ${value}
          </span>
          <button 
            class="whatsapp-btn absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg text-xs flex items-center" 
            data-phone="${phoneNumber}" 
            onclick="event.stopPropagation(); window.open('https://wa.me/${phoneNumber.length === 10 ? '91' + phoneNumber : phoneNumber}', '_blank');"
          >
            <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"></path>
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10z"></path>
            </svg>
            WhatsApp
          </button>
        </div>
      `;
    }
    
    // Handle numbers with special formatting
    if (isNumeric(value)) {
      // For percentage columns
      if (col.toLowerCase().includes('percent') || col.toLowerCase().includes('rate')) {
        return `<span class="font-medium">${parseFloat(value).toFixed(1)}%</span>`;
      }
      // For score columns, add a visual indicator
      if (col.toLowerCase().includes('score') || col.toLowerCase().includes('rating')) {
        const score = parseFloat(value);
        const scoreClass = score > 80 ? 'text-green-400' : (score > 60 ? 'text-yellow-400' : 'text-red-400');
        return `<span class="${scoreClass} font-medium">${score.toFixed(1)}</span>`;
      }
    }
    
    // Highlight status columns
    if (col.toLowerCase() === 'status') {
      const statusClasses = {
        'active': 'bg-green-500/20 text-green-300',
        'inactive': 'bg-gray-500/20 text-gray-300',
        'pending': 'bg-yellow-500/20 text-yellow-300',
        'rejected': 'bg-red-500/20 text-red-300',
        'approved': 'bg-green-500/20 text-green-300',
        'qualified': 'bg-purple-500/20 text-purple-300',
        'not qualified': 'bg-red-500/20 text-red-300'
      };
      
      const valueStr = value?.toString().toLowerCase() || '';
      const statusClass = valueStr in statusClasses 
        ? statusClasses[valueStr as keyof typeof statusClasses] 
        : 'bg-blue-500/20 text-blue-300';
      
      return `<span class="px-2 py-1 rounded-full text-xs ${statusClass}">${value}</span>`;
    }
    
    // Format dates if detected
    if (typeof value === 'string' && 
        (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{2}\/\d{2}\/\d{4}/))) {
      return `<span class="text-gray-400">${value}</span>`;
    }
    
    // Default text formatting
    return String(value);
  };

  return `
    <div class="overflow-x-auto mt-6 rounded-xl shadow-xl border border-white/10">
      <table class="min-w-full">
        <thead>
          <tr class="bg-gradient-to-r from-purple-900/50 to-gray-800/50 text-left">
            ${columns.map(col => `
              <th class="px-6 py-4 border-b border-white/20 text-sm font-medium text-purple-300 uppercase tracking-wider">
                <span class="flex items-center">
                  ${col.replace(/_/g, ' ')}
                  <svg class="ml-1 w-4 h-4 text-gray-400 hover:text-purple-300 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </span>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-white/10 bg-black/20 backdrop-blur-xl">
          ${jsonData.map((row, rowIndex) => `
            <tr class="transition-colors hover:bg-white/10">
              ${columns.map((col, colIndex) => {
                const cellValue = formatCellContent(row[col], col, rowIndex);
                // First column gets special styling
                if (colIndex === 0) {
                  return `
                    <td class="pl-6 pr-3 py-4 text-sm font-medium text-purple-200 whitespace-nowrap">
                      ${cellValue}
                    </td>
                  `;
                }
                return `
                  <td class="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                    ${cellValue}
                  </td>
                `;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="mt-3 flex justify-between items-center">
      <button id="downloadCSV" class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
        <span class="mr-2">Download CSV</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      </button>
      <div class="text-xs text-gray-400">
        Showing ${jsonData.length} result${jsonData.length !== 1 ? 's' : ''}
      </div>
    </div>
  `;
};
  React.useEffect(() => {
    const downloadButton = document.getElementById('downloadCSV');
    if (downloadButton) {
      downloadButton.addEventListener('click', () => downloadAsCSV(tableData));
      return () => {
        downloadButton.removeEventListener('click', () => downloadAsCSV(tableData));
      };
    }
  }, [results.resume, tableData]);


  const handleWhatsAppConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const numberInput = document.getElementById("number") as HTMLInputElement;
    const messageInput = document.getElementById("message") as HTMLTextAreaElement;
    const phoneNumber = numberInput.value.replace(/\D/g, '');

    if (phoneNumber.length >= 10) {
      const formattedNumber = phoneNumber.length === 10 ? `91${phoneNumber}` : phoneNumber;
      
      // Combine default message with custom message
      const defaultMessage = "Your resume has been shortlisted.";
      const customMessage = messageInput.value.trim();
      const fullMessage = customMessage 
        ? `${defaultMessage} ${customMessage}` 
        : defaultMessage;
      
      // Properly encode the message for URL
      const encodedMessage = encodeURIComponent(fullMessage);
      
      // Open WhatsApp with the pre-filled message
      window.open(`https://wa.me/${formattedNumber}?text=${encodedMessage}`, '_blank');
    } else {
      alert('Please enter a valid phone number');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('jobPost')}
            className={`flex items-center px-6 py-4 focus:outline-none transition-colors ${
              activeTab === 'jobPost'
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            Create Job Post
          </button>
          <button
            onClick={() => setActiveTab('uploadJD')}
            className={`flex items-center px-6 py-4 focus:outline-none transition-colors ${
              activeTab === 'uploadJD'
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload JD
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex items-center px-6 py-4 focus:outline-none transition-colors ${
              activeTab === 'resume'
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            Process Resumes
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center px-6 py-4 focus:outline-none transition-colors ${
              activeTab === 'whatsapp'
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Phone className="w-5 h-5 mr-2" />
            WhatsApp Connect
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'jobPost' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Create Job Post</h2>
             <form onSubmit={handleJobPostSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-300">
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="jobTitle"
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-300">
                      Experience Required
                    </label>
                    <input
                      type="text"
                      id="experience"
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. 3-5 years"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. New York, NY"
                    />
                  </div>
                  <div>
                    <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-300">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      id="salaryRange"
                      className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. $100,000 - $150,000"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-300">
                    Additional Details
                  </label>
                  <textarea
                    id="additionalDetails"
                    rows={4}
                    className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter job description, requirements, and other details..."
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Generate Job Post
                    </>
                  )}
                </button>
              </form>
              {results.jobPost && (
                <div dangerouslySetInnerHTML={{ __html: results.jobPost }} />
              )}
            </div>
          )}

          {activeTab === 'uploadJD' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Upload Job Description</h2>
              <form onSubmit={(e) => handleFileUpload(e, 'jd')} className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-white/10 bg-white/5 hover:bg-white/10">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PDF, DOC, or DOCX (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" name="file" accept=".pdf,.doc,.docx" />
                  </label>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload JD
                    </>
                  )}
                </button>
              </form>
              {results.jd && (
                <div dangerouslySetInnerHTML={{ __html: results.jd }} />
              )}
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Process Resumes</h2>
               <form onSubmit={(e) => handleFileUpload(e, 'process-resumes')} className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-white/10 bg-white/5 hover:bg-white/10">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PDF, DOC, or DOCX (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" name="files" accept=".pdf,.doc,.docx" multiple />
                  </label>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Process Resumes
                    </>
                  )}
                </button>
              </form>
              {results.resume && (
                <div dangerouslySetInnerHTML={{ __html: results.resume }} />
              )}
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">WhatsApp Connect</h2>
              <form onSubmit={handleWhatsAppConnect} className="space-y-4">
                <div>
                  <label htmlFor="number" className="block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="number"
                    className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                    Additional Message <span className="text-xs text-gray-500">(A default message "Your resume has been shortlisted" will be included)</span>
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    className="mt-1 block w-full rounded-lg bg-white/5 border border-white/10 text-white px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Add any additional details here..."
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Connect on WhatsApp
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
