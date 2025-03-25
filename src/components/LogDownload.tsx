import React, { useRef } from 'react';
import { Button } from 'react-bootstrap';
import { DailyLog } from '../types';

interface LogDownloadProps {
  dailyLog: DailyLog;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const LogDownload: React.FC<LogDownloadProps> = ({ dailyLog, canvasRef }) => {
  const downloadLog = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const date = new Date(dailyLog.date).toISOString().split('T')[0];
      const filename = `eld_log_${date}.png`;
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      
      // Append to the document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printLog = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      
      // Create a temporary window with only the image
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>ELD Log - ${new Date(dailyLog.date).toLocaleDateString()}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; }
                img { max-width: 100%; height: auto; }
                @media print {
                  body { margin: 0; }
                  img { width: 100%; }
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" alt="ELD Log" />
              <script>
                // Automatically print when loaded
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 100);
                  }, 200);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="flex space-x-2 mt-2">
      <Button 
        variant="outline-primary" 
        size="sm" 
        onClick={downloadLog}
        className="flex items-center"
      >
        <svg 
          className="w-4 h-4 mr-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download
      </Button>
      
      <Button 
        variant="outline-secondary" 
        size="sm" 
        onClick={printLog}
        className="flex items-center"
      >
        <svg 
          className="w-4 h-4 mr-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        Print
      </Button>
    </div>
  );
};

export default LogDownload;