import React, { useState } from 'react';
import { useRouteError, Link, useNavigate } from 'react-router';
import { MdErrorOutline, MdArrowBack, MdHome, MdBugReport, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  console.error("Route Error:", error);

  let title = "Unexpected Error";
  let message = "Something went wrong on our end.";
  let statusCode = 500;
  let suggestion = "Please try again later or contact support if the problem persists.";

  if (error?.status === 404) {
    title = "Page Not Found";
    message = "We couldn't find the page you're looking for.";
    statusCode = 404;
    suggestion = "The page might have been removed, renamed, or doesn't exist.";
  } else if (error?.status === 403) {
    title = "Access Denied";
    message = "You don't have permission to view this page.";
    statusCode = 403;
    suggestion = "Please contact your administrator if you believe this is a mistake.";
  } else if (error?.status === 401) {
    title = "Unauthorized";
    message = "You need to be logged in to access this page.";
    statusCode = 401;
    suggestion = "Please sign in to continue.";
  } else if (error?.status === 503) {
    title = "Service Unavailable";
    message = "Our servers are currently busy or under maintenance.";
    statusCode = 503;
    suggestion = "Please try refreshing the page in a few minutes.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 font-inter p-6">
      <div className="max-w-lg w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 md:p-12 text-center transition-all duration-300 hover:shadow-2xl">
        
        {/* --- Icon & Status Code --- */}
        <div className="relative mb-8 group">
          <h1 className="text-[150px] leading-none font-black text-gray-100 select-none tracking-tighter transition-colors duration-500 group-hover:text-gray-200">
            {statusCode}
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             
          </div>
        </div>

        {/* --- Text Content --- */}
        <div className="relative z-10 -mt-4 space-y-3">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            {title}
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            {message}
          </p>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            {suggestion}
          </p>
        </div>

        {/* --- Technical Details (Collapsible) --- */}
        {(error?.statusText || error?.message) && (
          <div className="mt-8">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-primary flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              {showDetails ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              {showDetails ? "Hide" : "Show"} Technical Details
            </button>
            
            <div className={`mt-3 overflow-hidden transition-all duration-300 ${showDetails ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="bg-gray-100 rounded p-3 text-left border border-gray-200 shadow-inner">
                <p className="font-mono text-xs text-red-600 break-words">
                  <span className="font-bold text-gray-500">Error:</span> {error.statusText || error.message}
                </p>
                {error.data && (
                   <p className="font-mono text-[10px] text-gray-500 mt-1 break-words">
                     {JSON.stringify(error.data).slice(0, 100)}...
                   </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- Action Buttons --- */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 transition-all active:scale-95"
          >
            <MdArrowBack size={20} /> Go Back
          </button>
          
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 shadow-md"
          >
            <MdHome size={20} /> Back to Home
          </Link>
        </div>

        {/* --- Support Link --- */}
        <div className="mt-8 pt-6 border-t border-gray-100">
           <a href="mailto:support@example.com" className="text-xs font-medium text-gray-400 hover:text-primary flex items-center justify-center gap-1 transition-colors">
             <MdBugReport /> Report a problem
           </a>
        </div>

      </div>
    </div>
  );
};

export default ErrorPage;