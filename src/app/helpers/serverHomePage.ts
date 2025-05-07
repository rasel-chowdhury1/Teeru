// Converted version of serverHomePage.js to serverHomePage.ts

import fs from 'fs';
import path from 'path';
import os from 'os';
import osUtils from 'os-utils';
import dotenv from 'dotenv';
dotenv.config();

const responseLogFilePath = path.resolve(__dirname, '../../ResponseTime.log');
const errorLogFilePath = path.resolve(__dirname, '../../app.log');

interface ErrorLogEntry {
  timestamp: string;
  method: string;
  statusCode: string;
  message: string;
  errorPath: string;
  stack: string;
}

interface ResponseLogEntry {
  timestamp: string;
  route: string;
  method: string;
  responseTime: number;
  label: 'Low' | 'Medium' | 'High';
}

function readLogFile(): {
  errorLogs: ErrorLogEntry[];
  responseTimeLogs: ResponseLogEntry[];
} {
  const errorLogs: ErrorLogEntry[] = [];
  const responseTimeLogs: ResponseLogEntry[] = [];

  try {
    const responseLogData = fs.readFileSync(responseLogFilePath, 'utf8');
    responseLogData.split('\n').forEach((entry) => {
      if (!entry.trim()) return;
      try {
        const log = JSON.parse(entry);
        if (log.responseTime) {
          const responseTime = parseFloat(log.responseTime);
          const label =
            responseTime > 2000 ? 'High' : responseTime > 1000 ? 'Medium' : 'Low';

          responseTimeLogs.push({
            timestamp: new Date(log.timestamp).toLocaleString(),
            route: log.url || 'N/A',
            method: log.method || 'N/A',
            responseTime,
            label,
          });
        }
      } catch (err) {
        console.error('Error parsing response time log entry:', err);
      }
    });
  } catch (err) {
    console.error('Error reading response time log file:', err);
  }

  try {
    const errorLogData = fs.readFileSync(errorLogFilePath, 'utf8');
    errorLogData.split('\n').forEach((entry) => {
      if (!entry.trim()) return;
      try {
        const log = JSON.parse(entry);
        if (log.level === 'error' && !(log.url && log.url.includes('/favicon.ico'))) {
          errorLogs.push({
            timestamp: new Date(log.timestamp).toLocaleString(),
            method: log.method || 'N/A',
            statusCode: log.status || 'N/A',
            message: log.message,
            errorPath: log.url || 'N/A',
            stack: log.stack || 'No stack trace available',
          });
        }
      } catch (err) {
        console.error('Error parsing error log entry:', err);
      }
    });
  } catch (err) {
    console.error('Error reading error log file:', err);
  }

  return {
    errorLogs: errorLogs.reverse(),
    responseTimeLogs: responseTimeLogs.reverse(),
  };
}

async function generateCpuUsageHtml(): Promise<string> {
  return new Promise((resolve) => {
    osUtils.cpuUsage((usage: number) => {
      const totalCores = os.cpus().length;
      const cpuUsagePercentage = usage * 100;
      const usedCores = Math.ceil((cpuUsagePercentage / 100) * totalCores);
      const idleCores = totalCores - usedCores;

      resolve(`
        <div id="cpu-usage">
          <h2>CPU Usage</h2>
          <div class="cpu-stats">
            <p><strong>Total Cores:</strong> ${totalCores}</p>
            <p><strong>CPU Usage:</strong> ${cpuUsagePercentage.toFixed(2)}%</p>
            <p><strong>Used Cores:</strong> ${usedCores}</p>
            <p><strong>Idle Cores:</strong> ${idleCores}</p>
          </div>
        </div>
      `);
    });
  });
}

async function serverHomePage(): Promise<string> {
  const { errorLogs, responseTimeLogs } = readLogFile();

  // Import your existing generateErrorLogTable, generateResponseTimeTable here or define them in TS
  const errorLogTableHtml = '...'; // Call your error log table generator
  const responseTimeTableHtml = '...'; // Call your response time table generator
  const cpuUsageHtml = await generateCpuUsageHtml();

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${process.env.PROJECT_NAME} Server</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes growBar {
          from { width: 0; }
          to { width: var(--target-width); }
        }

        body {
          font-family: 'Roboto', sans-serif;
          background-color: #0F172A;
          color: #E2E8F0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          overflow-x: hidden;
        }

        .container {
          width: 95%; /* Increased width */
          max-width: 1400px; /* Increased max-width */
          background: rgba(30, 41, 59, 0.8);
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          display: none;
          animation: fadeIn 0.5s ease-out;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(30, 41, 59, 0) 70%);
          animation: rotate 20s linear infinite;
          z-index: -1;
        }

        h1, h2 {
          font-size: 2.2em;
          color: #60A5FA;
          text-align: center;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .log-table, .response-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 8px;
          margin-top: 20px;
        }

        th, td {
          padding: 12px;
          border: none;
          color: #E2E8F0;
          background-color: rgba(45, 55, 72, 0.7);
          transition: all 0.3s ease;
        }

        th {
          background-color: rgba(59, 130, 246, 0.7);
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        tr {
          transition: all 0.3s ease;
        }

        tr:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        tr:hover td {
          background-color: rgba(55, 65, 81, 0.9);
        }

        .tabs {
          display: flex;
          justify-content: space-around;
          background: rgba(45, 55, 72, 0.7);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 15px;
          padding: 5px;
          position: relative;
        }

        .tabs::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(to right, #3B82F6, #60A5FA, #3B82F6);
          animation: slideIn 1s ease-out;
        }

        .tabs button {
          flex-grow: 1;
          padding: 12px;
          background: rgba(75, 85, 99, 0.7);
          color: #E2E8F0;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 8px;
          margin: 0 5px;
          font-weight: bold;
          position: relative;
          overflow: hidden;
        }

        .tabs button::before {
          content: '';
          position: absolute;
          top: -100%;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(59, 130, 246, 0.2);
          transition: all 0.3s ease;
        }

        .tabs button:hover::before {
          top: 0;
        }

        .tabs button:hover, .tabs button.active {
          background: rgba(59, 130, 246, 0.7);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
        }

        .tab-content {
          display: none;
          margin-top: 20px;
          animation: slideIn 0.5s ease-out;
        }

        .tab-content.active {
          display: block;
        }

        .high-label {
          background-color: rgba(239, 68, 68, 0.2);
          color: #EF4444;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          animation: blink 2s infinite;
        }

        .medium-label {
          background-color: rgba(245, 158, 11, 0.2);
          color: #F59E0B;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
        }

        .low-label {
          background-color: rgba(16, 185, 129, 0.2);
          color: #10B981;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
        }

        .stack-trace, .log-trace {
          max-height: 120px;
          max-width: 500px !important;
          overflow-y: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-size: 0.9em;
          background: rgba(55, 65, 81, 0.7);
          padding: 10px;
          border-radius: 8px;
          color: #E2E8F0;
          word-break: break-word;
          margin-top: 10px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .stack-trace:hover, .log-trace:hover {
          max-height: 300px;
        }

        .login-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: rgba(30, 41, 59, 0.8);
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          text-align: center;
          animation: fadeIn 0.5s ease-out, float 6s ease-in-out infinite;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(30, 41, 59, 0) 70%);
          animation: rotate 20s linear infinite;
          z-index: -1;
        }

        .login-container input {
          padding: 12px;
          margin: 10px 0;
          border-radius: 8px;
          border: 1px solid #4B5563;
          width: 100%;
          max-width: 300px;
          background-color: rgba(45, 55, 72, 0.7);
          color: #E2E8F0;
          transition: all 0.3s ease;
        }

        .login-container input:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
          transform: scale(1.05);
        }

        .login-container button, .logout-button {
          padding: 12px 24px;
          background-color: rgba(59, 130, 246, 0.7);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
        }

        .login-container button::before, .logout-button::before {
          content: '';
          position: absolute;
          top: -100%;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .login-container button:hover::before, .logout-button:hover::before {
          top: 0;
        }

        .login-container button:hover, .logout-button:hover {
          background-color: rgba(37, 99, 235, 0.7);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
        }

        .logout-button {
          animation: pulse 2s infinite;
        }

        .server-status {
          font-size: 1.2em;
          margin-bottom: 20px;
          animation: pulse 2s infinite;
          padding: 8px 16px;
          background-color: rgba(16, 185, 129, 0.2);
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .cpu-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .cpu-stat-card {
          background: rgba(45, 55, 72, 0.7);
          border-radius: 10px;
          padding: 15px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .cpu-stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }

        .cpu-stat-card h3 {
          margin: 0 0 10px 0;
          color: #60A5FA;
        }

        .cpu-stat-value {
          font-size: 1.5em;
          font-weight: bold;
          color: #E2E8F0;
        }

        .cpu-usage-bar {
          height: 20px;
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          margin-top: 10px;
        }

        .cpu-usage-fill {
          height: 100%;
          background: #3B82F6;
          border-radius: 10px;
          transition: width 1s ease-in-out;
          animation: growBar 1s ease-out;
        }

        .print-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 4px;
          animation: pulse 2s infinite;
        }

        .print-button:hover {
          background-color: #45a049;
        }

        @media print {
          body {
            background: none;
            color: black;
            background-image: none;
            overflow-x: visible;
          }
          
          .container {
            width: 100%;
            max-width: 100%;
            padding: 0;
            background: transparent;
            animation: none;
            box-shadow: none;
          }

          .container::before {
            display: none;
          }

          .tabs {
            display: none;
          }

          .log-table, .response-table {
            width: 100%;
          }

          .tabs button, .btn-primary {
            display: none;
          }

          h1, h2 {
            font-size: 1.5em;
            text-align: left;
          }

          .stack-trace, .log-trace {
            max-height: none;
            max-width: none;
            overflow: visible;
          }
          
          .tabs button.active {
            background-color: rgba(59, 130, 246, 0.7);
          }
        }

        .div-center {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
        }

      </style>
    </head>
    <body>
      <!-- Login Form -->
      <div class="login-container" id="login-container">
        <h2>Server Monitoring Login</h2>
        <div class="server-status">Server Status: <span id="server-status-text">Checking...</span></div>
        <input type="text" id="username" placeholder="Username" />
        <input type="password" id="password" placeholder="Password" />
        <button onclick="authenticate()">Login</button>
        
      </div>

      <!-- Main Server Monitoring Content -->
      <div class="container" id="server-container">
        <h1>${process.env.PROJECT_NAME} Server</h1>
        
        <div class="div-center">
        <button class="logout-button" onclick="logout()">Logout</button>
        <button class="print-button" onclick="printCurrentTab()">Print Tab</button>
        </div>
        <div class="tabs">
          <button class="tablink active" onclick="openTab(event, 'cpu-usage')">CPU Usage</button>
          <button class="tablink" onclick="openTab(event, 'log-table')">Error Logs</button>
          <button class="tablink" onclick="openTab(event, 'response-table')">Response Times</button>
        </div>
        <div id="cpu-usage" class="tab-content active">
          ${cpuUsageHtml}
        </div>
        <div id="log-table" class="tab-content">${errorLogTableHtml}</div>
        <div id="response-table" class="tab-content">${responseTimeTableHtml}</div>
      </div>

      <script>
        function printCurrentTab() {
          window.print();
        }
        function authenticate() {
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          const validUsername = "${process.env.MONITOR_USERNAME}";
          const validPassword = "${process.env.MONITOR_PASSWORD}";

          if (username === validUsername && password === validPassword) {
            localStorage.setItem('isLoggedIn', 'true');
            showServerContainer();
          } else {
            alert("Invalid credentials. Please try again.");
          }
        }

        function showServerContainer() {
          document.getElementById('login-container').style.display = 'none';
          document.getElementById('server-container').style.display = 'block';
        }

        function logout() {
          localStorage.removeItem('isLoggedIn');
          document.getElementById('login-container').style.display = 'flex';
          document.getElementById('server-container').style.display = 'none';
        }

        function openTab(evt, tabName) {
          var i, tabcontent, tablinks;
          tabcontent = document.getElementsByClassName("tab-content");
          for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].classList.remove("active");
          }
          tablinks = document.getElementsByClassName("tablink");
          for (i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
          }
          document.getElementById(tabName).classList.add("active");
          evt.currentTarget.classList.add("active");
        }

        // Check login status on page load
        window.onload = function() {
          if (localStorage.getItem('isLoggedIn') === 'true') {
            showServerContainer();
          }
          // Simulate server status check
          setTimeout(() => {
            document.getElementById('server-status-text').textContent = 'Online';
            document.getElementById('server-status-text').style.color = '#10B981';
          }, 2000);
        };

        // Add some animation to table rows
        function animateTableRows() {
          const tables = document.querySelectorAll('.log-table, .response-table');
          tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            rows.forEach((row, index) => {
              row.style.animation = 'fadeIn 0.5s ease-out ' + (index * 0.1) + 's';
            });
          });
        }

        // Call the animation function when switching tabs
        const tabButtons = document.querySelectorAll('.tablink');
        tabButtons.forEach(button => {
          button.addEventListener('click', () => {
            setTimeout(animateTableRows, 100);
          });
        });

        // Initial animation call
        animateTableRows();
      </script>
    </body>
  </html>
`;
}

export default serverHomePage;
