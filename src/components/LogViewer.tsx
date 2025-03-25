import React from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { DailyLog, Trip } from '../types';
import ELDLogGenerator from './ELDLogGenerator';

interface LogViewerProps {
  logs: DailyLog[];
  activeLog: number;
  onLogChange: (index: number) => void;
  trip: Trip | null;
}

const LogViewer: React.FC<LogViewerProps> = ({ logs, activeLog, onLogChange, trip }) => {
  if (!logs || logs.length === 0 || !trip) {
    return (
      <div className="bg-white/90 rounded-xl p-8 text-center border border-gray-200 shadow-sm">
        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg 
            className="w-10 h-10 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700">No logs available</h3>
        <p className="text-sm text-gray-500 mt-1">Logs will appear here after trip planning</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      off_duty: 'bg-gray-100 text-gray-800',
      sleeper: 'bg-indigo-100 text-indigo-800',
      driving: 'bg-blue-100 text-blue-800',
      on_duty: 'bg-green-100 text-green-800',
      default: 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || colors.default;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      off_duty: 'bi-house-door',
      sleeper: 'bi-moon',
      driving: 'bi-truck',
      on_duty: 'bi-clipboard-check',
      default: 'bi-clock'
    };
    return icons[status as keyof typeof icons] || icons.default;
  };

  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace('24:', '00:');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Tab.Container activeKey={activeLog.toString()} onSelect={(key) => onLogChange(Number(key))}>
        <Nav 
          variant="pills" 
          className="flex-nowrap overflow-x-auto px-4 pt-4 pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {logs.map((log, index) => (
            <Nav.Item key={log.id} className="flex-shrink-0 mr-2">
              <Nav.Link
                eventKey={index.toString()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeLog === index
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {formatDate(log.date)}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <Tab.Content className="p-4">
          {logs.map((log, index) => (
            <Tab.Pane key={log.id} eventKey={index.toString()}>
              <div className="space-y-6">
                {/* Log Canvas - Generate ELD Log client-side */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden p-4">
                  <ELDLogGenerator dailyLog={log} trip={trip} />
                </div>

                {/* Log Entries */}
                <div className="w-1/2 min-w-fit mr-auto">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg 
                      className="w-5 h-5 mr-2 text-gray-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    Log Entries
                  </h4>
                  
                  <div className="space-y-3">
                    {log.entries?.map((entry, entryIndex) => (
                      <div 
                        key={entryIndex} 
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(entry.status)}`}>
                            <i className={`bi ${getStatusIcon(entry.status)} text-sm`}></i>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium text-gray-800">
                                {formatStatus(entry.status)}
                              </h5>
                              <div className="text-xs text-gray-500">
                                {formatTime(entry.start_time)} - {entry.end_time ? formatTime(entry.end_time) : 'Present'}
                              </div>
                            </div>
                            
                            {entry.location && (
                              <div className="mt-1 text-sm text-gray-600 flex items-center">
                                <svg 
                                  className="w-3 h-3 mr-1.5 text-gray-400" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  ></path>
                                </svg>
                                <span className="truncate">{entry.location}</span>
                              </div>
                            )}
                            
                            {entry.remarks && (
                              <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                <p className="whitespace-pre-line">{entry.remarks}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Tab.Pane>
          ))}
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    off_duty: 'Off Duty',
    sleeper: 'Sleeper Berth',
    driving: 'Driving',
    on_duty: 'On Duty',
    default: status.replace('_', ' ')
  };
  return statusMap[status] || statusMap.default;
};

export default LogViewer;