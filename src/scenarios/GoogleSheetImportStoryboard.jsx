import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  ExternalLink, 
  RefreshCw,
  Network,
  Database
} from 'lucide-react';
import InspectorPanel from '../components/InspectorPanel';
import NodeDataFlowDiagram from '../components/NodeDataFlowDiagram';
import LiveDatabaseTable from '../components/LiveDatabaseTable';

export default function GoogleSheetImportStoryboard() {
  const SPREADSHEET_ID = '1wsv_BMdI02I_VRXO3taTvdXUfcpe1gYYtkIkDYqnIT0';
  const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/`;

  const EXPECTED_HEADERS = [
    'firstName', 'lastName', 'email', 'phone', 
    'city', 'country', 'jobId', 'institution', 
    'degree', 'major', 'eduStartDate', 'eduEndDate'
  ];

  const FLOW_NODES = [
    { id: 'sheet', label: 'Google Sheets', sublabel: 'Source CSV Stream', icon: 'sheet', activeSteps: [1] },
    { id: 'worker', label: 'ETL Pipeline', sublabel: 'Parser & Normalizer', icon: 'workflow', activeSteps: [2] },
    { id: 'sr_api', label: 'SmartRecruiters API', sublabel: 'Batch Ingestion', icon: 'server', activeSteps: Array.from({ length: 50 }, (_, i) => i + 3) },
    { id: 'sr_db', label: 'Candidate DB', sublabel: 'PostgreSQL Database', icon: 'database', activeSteps: Array.from({ length: 50 }, (_, i) => i + 3) }
  ];

  const DB_COLUMNS = [
    { key: 'candidateId', label: 'CANDIDATE_ID' },
    { key: 'name', label: 'FULL_NAME' },
    { key: 'email', label: 'EMAIL' },
    { key: 'jobId', label: 'TARGET_JOB_ID' }
  ];

  const [sheetRows, setSheetRows] = useState([]);
  const [headers, setHeaders] = useState(EXPECTED_HEADERS);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [logs, setLogs] = useState([]);
  const [dbRecords, setDbRecords] = useState([]);
  const [activePacket, setActivePacket] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const TOTAL_STEPS = Math.max(sheetRows.length + 2, 3);
  const isCompleted = currentStep >= TOTAL_STEPS;

  const getStepDelay = (nextStepNumber, entryCount) => {
    if (nextStepNumber <= 4) return 2000;
    if (entryCount <= 3) return 3000;
    if (entryCount <= 5) return 1500;
    if (entryCount <= 10) return 500;
    return 150;
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: EXPECTED_HEADERS, rows: [] };

    const splitLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const rawHeaders = splitLine(lines[0]);
    const parsedRows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = splitLine(lines[i]);
      const rowObj = { id: i };
      rawHeaders.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });
      parsedRows.push(rowObj);
    }

    return { headers: rawHeaders, rows: parsedRows };
  };

  const fetchSheetData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const csvText = await response.text();
      const { headers: fetchedHeaders, rows: fetchedRows } = parseCSV(csvText);

      if (fetchedHeaders.length > 0) setHeaders(fetchedHeaders);
      setSheetRows(fetchedRows);
    } catch (err) {
      console.error('Failed to fetch Google Sheet CSV:', err);
      setFetchError('Sheet link restricted or offline. Displaying fallback dataset.');
      
      setSheetRows([
        {
          id: 1,
          firstName: 'Elena', lastName: 'Rostova', email: 'elena.rostova@example.com',
          phone: '+1-555-0142', city: 'San Francisco', country: 'US', jobId: 'job-7712',
          institution: 'UC Berkeley', degree: 'Bachelor of Science', major: 'Computer Science',
          eduStartDate: '2018-09-01', eduEndDate: '2022-05-15'
        },
        {
          id: 2,
          firstName: 'Marcus', lastName: 'Vance', email: 'marcus.vance@example.com',
          phone: '+1-555-0198', city: 'London', country: 'GB', jobId: 'job-8840',
          institution: 'Imperial College London', degree: 'Master of Engineering', major: 'Software Engineering',
          eduStartDate: '2019-10-01', eduEndDate: '2023-06-30'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

  useEffect(() => {
    let timer;
    if (isRunningAll && currentStep > 0 && currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1;
      const delay = getStepDelay(nextStep, sheetRows.length);

      timer = setTimeout(() => {
        executeStep(nextStep);
      }, delay);
    } else if (currentStep >= TOTAL_STEPS) {
      setIsRunningAll(false);
    }
    return () => clearTimeout(timer);
  }, [isRunningAll, currentStep, TOTAL_STEPS, sheetRows.length]);

  const formatSmartRecruitersPayload = (row) => ({
    firstName: row.firstName || row['First Name'] || row[headers[0]] || '',
    lastName: row.lastName || row['Last Name'] || row[headers[1]] || '',
    email: row.email || row['Email'] || row[headers[2]] || '',
    phoneNumber: row.phone || row['Phone'] || row[headers[3]] || '',
    location: {
      city: row.city || row['City'] || row[headers[4]] || '',
      country: row.country || row['Country'] || row[headers[5]] || ''
    },
    education: [
      {
        institution: row.institution || row['Institution'] || row[headers[7]] || '',
        degree: row.degree || row['Degree'] || row[headers[8]] || '',
        major: row.major || row['Major'] || row[headers[9]] || '',
        startDate: row.eduStartDate || row['Edu Start Date'] || row[headers[10]] || '',
        endDate: row.eduEndDate || row['Edu End Date'] || row[headers[11]] || ''
      }
    ],
    sourceDetails: { sourceId: 'GoogleSheetsBatchImport' }
  });

  const executeStep = (stepNumber) => {
    if (stepNumber > TOTAL_STEPS) return;
    const time = new Date().toLocaleTimeString();

    if (stepNumber === 1) {
      setActivePacket({ fromNode: 'sheet', label: 'CSV Stream' });
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now(),
          time,
          title: 'Backend Trigger: Connect Google Sheets API',
          details: `Connected to Google Sheets CSV stream. Verified spreadsheet ID [${SPREADSHEET_ID}].`,
          payload: {
            spreadsheetUrl: SPREADSHEET_URL,
            status: 200,
            rowsDiscovered: sheetRows.length,
            detectedSchema: headers
          },
          statusType: 'action'
        }
      ]);
    } else if (stepNumber === 2) {
      setActivePacket({ fromNode: 'worker', label: 'JSON Batch' });
      const totalCount = sheetRows.length;
      const allNormalized = sheetRows.map((r) => formatSmartRecruitersPayload(r));

      const displayedRecords = totalCount > 20 
        ? [
            ...allNormalized.slice(0, 20),
            `... [${totalCount - 20} additional candidate records truncated for preview]`
          ]
        : allNormalized;

      setLogs((prev) => [
        ...prev,
        {
          id: Date.now(),
          time,
          title: 'Data Extraction & Schema Mapping',
          details: totalCount > 20 
            ? `Extracted ${totalCount} sheet rows. Showing first 20 normalized candidate payloads.`
            : 'Backend worker extracted raw sheet rows and formatted them into SmartRecruiters OpenAPI Candidate objects.',
          payload: {
            mappedFields: EXPECTED_HEADERS,
            totalRowsCount: totalCount,
            normalizedRecords: displayedRecords
          },
          statusType: 'process'
        }
      ]);
    } else {
      const rowIndex = stepNumber - 3;
      const targetRow = sheetRows[rowIndex];
      const isFinalRow = rowIndex === sheetRows.length - 1;

      if (targetRow) {
        const srPayload = formatSmartRecruitersPayload(targetRow);
        const targetJobId = targetRow.jobId || targetRow['Job ID'] || 'job-7712';

        setActivePacket({ fromNode: 'sr_api', label: `INSERT Row ${targetRow.id}` });

        setDbRecords((prev) => [
          ...prev,
          {
            id: targetRow.id,
            candidateId: `cand_gsheet_00${targetRow.id}`,
            name: `${srPayload.firstName} ${srPayload.lastName}`.trim() || 'Candidate',
            email: srPayload.email || '-',
            jobId: targetJobId,
            _rowStatus: 'added'
          }
        ]);

        setLogs((prev) => [
          ...prev,
          {
            id: Date.now(),
            time,
            title: `HTTP POST /postings/${targetJobId}/candidates (Row ${targetRow.id})`,
            details: `Dispatched OpenAPI candidate creation request for [${srPayload.firstName} ${srPayload.lastName}].`,
            payload: {
              targetPostingId: targetJobId,
              requestBody: srPayload,
              apiResponse: {
                status: 201,
                statusText: 'Created',
                candidateId: `cand_gsheet_00${targetRow.id}-uuid`,
                applicationId: `app_gsheet_10${targetRow.id}-uuid`
              }
            },
            statusType: isFinalRow ? 'success' : 'process'
          }
        ]);
      }
    }

    setCurrentStep(stepNumber);
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 0) {
      setLogs([]);
      setDbRecords([]);
      setActivePacket(null);
      executeStep(1);
    } else if (!isCompleted) {
      executeStep(currentStep + 1);
    }
  };

  const handleRunStep = () => !isCompleted && executeStep(currentStep + 1);

  const handleToggleRunAll = () => {
    if (isCompleted) return;
    if (isRunningAll) {
      setIsRunningAll(false);
    } else {
      setIsRunningAll(true);
      if (currentStep === 0) executeStep(1);
    }
  };

  return (
    <div className="sr-main-split">
      {/* LEFT PANEL */}
      <section className="sr-panel sr-panel-left" style={{ overflowY: 'auto' }}>
        <div className="sr-panel-content" style={{ width: '100%', maxWidth: 'none', display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2rem' }}>
          
          {/* Section 1: Form & Google Sheet Preview */}
          <div>
            <div className="sr-section-header">
              <span className="sr-badge sr-badge-blue">Live Google Sheet Source</span>
              <h2 className="sr-title">Batch Candidate Sourcing</h2>
              <p className="sr-subtitle">Previewing records directly from the linked Google Sheet.</p>
            </div>

            <form onSubmit={handleImportSubmit} className="sr-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--sr-color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="sr-icon-wrapper-primary" style={{ backgroundColor: '#107c41' }}>
                    <FileSpreadsheet className="sr-icon" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Sourcing Data Sheet</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--sr-color-text-muted)' }}>Read-Only Live API Connection</p>
                  </div>
                </div>

                <a 
                  href={SPREADSHEET_URL} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="sr-btn sr-btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                  title="Open spreadsheet in new tab"
                >
                  <span>Open Sheet</span>
                  <ExternalLink className="sr-icon-sm" />
                </a>
              </div>

              {fetchError && (
                <div style={{ fontSize: '0.75rem', color: 'var(--sr-color-text-muted)', marginBottom: '1rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--sr-color-primary-light)', borderRadius: 'var(--sr-radius-sm)', border: '1px solid var(--sr-color-border)' }}>
                  {fetchError}
                </div>
              )}

              <div 
                style={{ 
                  marginBottom: '1.25rem', 
                  overflowX: 'auto', 
                  overflowY: 'auto',
                  maxHeight: '380px',
                  borderRadius: 'var(--sr-radius-md)', 
                  border: '1px solid var(--sr-color-border)' 
                }}
              >
                {isLoading ? (
                  <div className="sr-empty-state" style={{ height: '160px' }}>
                    <RefreshCw className="sr-icon-lg sr-pulse" />
                    <p>Fetching spreadsheet rows...</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr style={{ backgroundColor: 'var(--sr-color-bg-surface)', borderBottom: '1px solid var(--sr-color-border)' }}>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--sr-color-text-muted)', fontWeight: 600, backgroundColor: 'var(--sr-color-bg-surface)' }}>#</th>
                        {headers.map((h, i) => (
                          <th key={i} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--sr-color-text-muted)', fontWeight: 600, backgroundColor: 'var(--sr-color-bg-surface)' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheetRows.map((row) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid var(--sr-color-border-subtle)' }}>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--sr-color-text-subtle)', backgroundColor: 'var(--sr-color-bg-base)' }}>{row.id}</td>
                          {headers.map((h, cIdx) => (
                            <td key={cIdx} style={{ padding: '0.5rem 0.75rem', color: 'var(--sr-color-text-main)' }}>
                              {row[h] !== undefined ? String(row[h]) : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="sr-form-actions">
                <button
                  type="submit"
                  disabled={isCompleted || isRunningAll || isLoading}
                  className={`sr-btn ${!isCompleted && !isRunningAll && !isLoading ? 'sr-btn-primary' : 'sr-btn-disabled'}`}
                >
                  <span>
                    {currentStep === 0 
                      ? 'Start Google Sheet Import' 
                      : isCompleted 
                      ? 'Batch Import Completed' 
                      : `Next Step (${currentStep + 1}/${TOTAL_STEPS})`}
                  </span>
                  <UploadCloud className="sr-icon-sm" />
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Node Data Flow */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Network size={18} style={{ color: '#3b82f6' }} />
              <h3 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 600, color: 'var(--sr-color-text-main, #f8fafc)' }}>
                System Node Architecture
              </h3>
            </div>
            <NodeDataFlowDiagram 
              nodes={FLOW_NODES} 
              activeStep={currentStep} 
              activePacket={activePacket} 
            />
          </div>

          {/* Section 3: Live Database Sync */}
          <div style={{ paddingBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Database size={18} style={{ color: '#10b981' }} />
              <h3 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 600, color: 'var(--sr-color-text-main, #f8fafc)' }}>
                SmartRecruiters DB Sync
              </h3>
            </div>
            <LiveDatabaseTable 
              tableName="SmartRecruiters DB (candidates)"
              records={dbRecords} 
              columns={DB_COLUMNS} 
            />
          </div>

        </div>
      </section>

      {/* RIGHT PANEL */}
      <InspectorPanel
        badgeText="Backend Processing Hub"
        title="Sheet ETL ➔ SmartRecruiters API"
        subtitle="Observe how spreadsheet rows are transformed into discrete OpenAPI POST requests."
        emptyMessage="Click 'Start Google Sheet Import' on the left or 'Run step' below to trigger the worker."
        logs={logs}
        isCompleted={isCompleted}
        isRunningAll={isRunningAll}
        isLoading={isLoading}
        onRunStep={handleRunStep}
        onToggleRunAll={handleToggleRunAll}
      />
    </div>
  );
}