import React, { useRef, useEffect } from 'react';
import { DailyLog, LogEntry, Trip } from '../types';
import LogDownload from './LogDownload';

interface ELDLogGeneratorProps {
  dailyLog: DailyLog;
  trip: Trip;
}

const ELDLogGenerator: React.FC<ELDLogGeneratorProps> = ({ dailyLog, trip }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !dailyLog || !dailyLog.entries || dailyLog.entries.length === 0) {
      return;
    }

    generateLogImage();
  }, [dailyLog]);

  const generateLogImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = 1100;
    const height = 550;
    canvas.width = width;
    canvas.height = height;

    // Fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Draw header section
    drawHeader(ctx, width, dailyLog.date);
    
    // Draw grid
    const gridTop = 150;
    const gridHeight = 320;
    const gridLeft = 100;
    const gridRight = width - 120;
    drawGrid(ctx, gridLeft, gridTop, gridRight, gridHeight, width);

    // Draw status labels and process log entries
    drawStatusData(ctx, gridLeft, gridTop, gridRight, gridHeight, dailyLog.entries);
  };

  const drawHeader = (ctx: CanvasRenderingContext2D, width: number, dateStr: string) => {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    
    // Draw header rectangle
    ctx.strokeRect(0, 0, width, 60);
    
    // Draw DOT text
    ctx.font = '10px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText("U.S. DEPARTMENT OF TRANSPORTATION", 10, 10);
    
    // Format date as MM DD YYYY - converting UTC to local time
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Draw date boxes
    const dateBoxLeft = 50;
    const dateSpacing = 60;
    
    ctx.font = 'bold 16px Arial';
    ctx.fillText(month, dateBoxLeft, 30);
    ctx.fillText(day, dateBoxLeft + dateSpacing, 30);
    ctx.fillText(year.toString(), dateBoxLeft + dateSpacing*2, 30);
    
    ctx.font = '10px Arial';
    ctx.fillText("(MONTH)", dateBoxLeft, 45);
    ctx.fillText("(DAY)", dateBoxLeft + dateSpacing, 45);
    ctx.fillText("(YEAR)", dateBoxLeft + dateSpacing*2, 45);
    
    // Center header
    const subtitle = "(ONE CALENDAR DAY — 24 HOURS)";
    const title = "DRIVER'S DAILY LOG";
    
    // Calculate center position for text
    const textBlockCenter = width / 2;
    const subtitleWidth = subtitle.length * 6;
    const textBlockLeft = textBlockCenter - (subtitleWidth / 2);
    
    ctx.font = 'bold 16px Arial';
    ctx.fillText(title, textBlockLeft, 20);
    ctx.font = '10px Arial';
    ctx.fillText(subtitle, textBlockLeft, 40);
    
    // Right header
    ctx.fillText("ORIGINAL — File at Home Termnal", width/2 + 150, 20);
    ctx.fillText("DUPLICATE — Driver retains possession for eight days", width/2 + 150, 40);
    
    // Draw minimal driver info section
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(width, 60);
    ctx.stroke();
    
    // Get carrier name from driver's last name
    const carrierName = trip && trip.driver ? 
      `Mumo Transportation` : 
      "Carrier Name";
    
    ctx.font = 'bold 16px Arial';
    ctx.fillText(carrierName, 20, 85);
    
    ctx.font = '10px Arial';
    ctx.fillText("(NAME OF CARRIER OR CARRIERS)", 20, 95);
    
    // Driver signature
    const driverName = trip && trip.driver ? 
      `Jack Mumo` : 
      "Driver Name";
    
    ctx.font = 'bold 16px Arial';
    ctx.fillText(driverName, width - 250, 85);
    
    ctx.font = '10px Arial';
    ctx.fillText("(DRIVER'S SIGNATURE IN FULL)", width - 250, 95);
  };

  const drawGrid = (
    ctx: CanvasRenderingContext2D, 
    gridLeft: number, 
    gridTop: number, 
    gridRight: number, 
    gridHeight: number,
    width: number
  ) => {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    
    // Grid dimensions
    const gridWidth = gridRight - gridLeft;
    
    // Draw the time grid header line
    ctx.beginPath();
    ctx.moveTo(0, gridTop);
    ctx.lineTo(width, gridTop);
    ctx.stroke();
    
    // Status labels
    const statuses: [string, number][] = [
      ["Off\nDuty", 0], 
      ["Sleeper\nBerth", 1], 
      ["Driving", 2], 
      ["On Duty\n(Not\nDriving)", 3]
    ];
    
    // Calculate row heights
    const rowHeight = gridHeight / 4;
    
    // Draw hour markings
    const hoursTextY = gridTop - 15;
    
    // Draw hour marks (0, 2, 4, 6, ..., 22, 24)
    for (let i = 0; i <= 24; i += 2) {
      const x = gridLeft + (i * gridWidth / 24);
      
      // Vertical tick mark
      ctx.beginPath();
      ctx.moveTo(x, gridTop - 5);
      ctx.lineTo(x, gridTop);
      ctx.stroke();
      
      // Hour text
      let hourText = i.toString();
      if (i === 0 || i === 24) hourText = "Midnight";
      else if (i === 12) hourText = "Noon";
      
      // Position text to avoid overlap
      const textWidth = hourText.length * 4;
      ctx.font = '10px Arial';
      ctx.fillText(hourText, x - textWidth/2, hoursTextY);
    }
    
    // Draw horizontal grid lines
    for (let i = 0; i <= 4; i++) {  // 4 status rows + bottom line
      const y = gridTop + (i * rowHeight);
      ctx.beginPath();
      ctx.moveTo(gridLeft, y);
      ctx.lineTo(gridRight, y);
      ctx.stroke();
    }
    
    // Draw vertical grid lines
    for (let i = 0; i <= 24; i++) {  // 0 to 24 hours
      const x = gridLeft + (i * gridWidth / 24);
      
      // Main lines at even hours
      if (i % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(x, gridTop);
        ctx.lineTo(x, gridTop + gridHeight);
        ctx.stroke();
      } else {
        // Short tick marks at odd hours
        for (let j = 0; j < 4; j++) {
          const tickY = gridTop + (j * rowHeight);
          const tickLength = 5;
          
          // Top tick
          ctx.beginPath();
          ctx.moveTo(x, tickY);
          ctx.lineTo(x, tickY + tickLength);
          ctx.stroke();
          
          // Bottom tick
          ctx.beginPath();
          ctx.moveTo(x, tickY + rowHeight - tickLength);
          ctx.lineTo(x, tickY + rowHeight);
          ctx.stroke();
        }
      }
    }
    
    // Draw status labels
    for (let i = 0; i < statuses.length; i++) {
      const [label, idx] = statuses[i];
      const y = gridTop + (Number(idx) * rowHeight) + (rowHeight / 2) - 15;
      
      // Handle multiline labels
      if (label.includes('\n')) {
        const lines = label.split('\n');
        for (let j = 0; j < lines.length; j++) {
          ctx.font = '14px Arial';
          ctx.fillText(lines[j], 20, y + (j * 15));
        }
      } else {
        ctx.font = '14px Arial';
        ctx.fillText(label, 20, y);
      }
    }
  };

  const drawStatusData = (
    ctx: CanvasRenderingContext2D, 
    gridLeft: number, 
    gridTop: number, 
    gridRight: number, 
    gridHeight: number, 
    entries: LogEntry[]
  ) => {
    if (!entries || entries.length === 0) return;
    
    const gridWidth = gridRight - gridLeft;
    const rowHeight = gridHeight / 4;
    
    // Status mapping
    const statusMap: Record<string, number> = {
      'off_duty': 0,
      'sleeper': 1,
      'driving': 2,
      'on_duty': 3
    };
    
    // Track hours by status
    const hoursByStatus: Record<string, number> = {
      'off_duty': 0,
      'sleeper': 0,
      'driving': 0,
      'on_duty': 0
    };
    
    // Sort entries by start time
    const sortedEntries = [...entries].sort((a, b) => {
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });
    
    // Create a timeline of status changes including vertical lines
    interface StatusPoint {
      time: number;  // In minutes from midnight
      status: string;
      x: number;     // X position on grid
      y: number;     // Y position on grid (center of row)
      isStart: boolean; // Whether this is the start or end of a segment
    }
    
    const statusTimeline: StatusPoint[] = [];
    
    // Process entries to build the timeline
    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      if (!entry.end_time) continue;
      
      // Convert times to local and extract minutes from midnight
      const startDate = new Date(entry.start_time);
      const endDate = new Date(entry.end_time);
      
      // Calculate minutes from midnight
      const startMinutes = (startDate.getHours() * 60) + startDate.getMinutes();
      let endMinutes = (endDate.getHours() * 60) + endDate.getMinutes();
      
      // Handle entries crossing midnight
      if (endMinutes < startMinutes) {
        endMinutes = 24 * 60;  // End at midnight
      }
      
      // Calculate positions
      const startX = gridLeft + (startMinutes * gridWidth / (24 * 60));
      const endX = gridLeft + (endMinutes * gridWidth / (24 * 60));
      const rowIndex = statusMap[entry.status] || 0;
      const y = gridTop + (rowIndex * rowHeight) + (rowHeight / 2);
      
      // Add start point
      statusTimeline.push({
        time: startMinutes,
        status: entry.status,
        x: startX,
        y: y,
        isStart: true
      });
      
      // Add end point
      statusTimeline.push({
        time: endMinutes,
        status: entry.status,
        x: endX,
        y: y,
        isStart: false
      });
      
      // Calculate duration in hours
      const durationSeconds = (endMinutes - startMinutes) * 60;
      const durationHours = durationSeconds / 3600;
      hoursByStatus[entry.status] += durationHours;
    }
    
    // Sort timeline by time
    statusTimeline.sort((a, b) => a.time - b.time);
    
    // Draw status lines including vertical connections
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    
    // Keep track of current status for each row
    const activeStatus: Record<string, boolean> = {
      'off_duty': false,
      'sleeper': false,
      'driving': false,
      'on_duty': false
    };
    
    if (statusTimeline.length > 0) {
      // Start drawing path
      ctx.beginPath();
      
      // Process each status change
      for (let i = 0; i < statusTimeline.length; i++) {
        const point = statusTimeline[i];
        
        if (point.isStart) {
          // Starting a new segment
          activeStatus[point.status] = true;
          ctx.moveTo(point.x, point.y);
          
          // Connect from previous status vertically if needed
          const prevIndex = i - 1;
          if (prevIndex >= 0 && !statusTimeline[prevIndex].isStart) {
            const prevPoint = statusTimeline[prevIndex];
            if (prevPoint.x === point.x && prevPoint.status !== point.status) {
              // Draw vertical line connecting points
              ctx.lineTo(point.x, point.y);
            }
          }
        } else {
          // Ending a segment
          activeStatus[point.status] = false;
          
          // Draw horizontal line to end of segment
          ctx.lineTo(point.x, point.y);
          
          // Check if we need to connect to next status
          const nextIndex = i + 1;
          if (nextIndex < statusTimeline.length && statusTimeline[nextIndex].isStart) {
            const nextPoint = statusTimeline[nextIndex];
            if (nextPoint.x === point.x) {
              // Draw vertical line to next status
              ctx.lineTo(nextPoint.x, nextPoint.y);
            }
          }
        }
      }
      
      // Draw all paths at once
      ctx.stroke();
    }
    
    // Helper function to convert decimal hours to HH:MM:SS format
    const formatHoursToHHMMSS = (hours: number) => {
      const totalSeconds = Math.floor(hours * 3600);
      const hoursStr = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const minutesStr = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const secondsStr = (totalSeconds % 60).toString().padStart(2, '0');
      return `${hoursStr}:${minutesStr}:${secondsStr}`;
    };
    
    // Draw the total hours on right side in HH:MM:SS format
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < Object.keys(hoursByStatus).length; i++) {
      const status = Object.keys(hoursByStatus)[i];
      const hours = hoursByStatus[status];
      const yPos = gridTop + (i * rowHeight) + (rowHeight / 2) - 5;
      
      // Format hours as HH:MM:SS
      const formattedHours = formatHoursToHHMMSS(hours);
      ctx.fillText(formattedHours, gridRight + 15, yPos);
    }
    
    // Draw total of all hours in HH:MM:SS format
    const totalHours = Object.values(hoursByStatus).reduce((sum, hours) => sum + hours, 0);
    const formattedTotal = formatHoursToHHMMSS(totalHours);
    ctx.fillText(`=${formattedTotal}`, gridRight + 15, gridTop + gridHeight + 10);
  };

  return (
    <div className="eld-log-container">
      <canvas 
        ref={canvasRef} 
        className="eld-log-canvas" 
        style={{ width: '100%', height: 'auto', maxWidth: '1100px' }}
      />
      <LogDownload dailyLog={dailyLog} canvasRef={canvasRef} />
    </div>
  );
};

export default ELDLogGenerator;