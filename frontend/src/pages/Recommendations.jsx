import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../context/AuthContext';

const Recommendations = () => {
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  
  // Selection controllers
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [teamSelection, setTeamSelection] = useState({}); // { [id]: boolean }
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'multiple'
  
  // Recommendations state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Single result state
  const [singleResult, setSingleResult] = useState(null);
  
  // Multiple results state
  const [multipleResult, setMultipleResult] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      if (response.data.success) {
        const list = response.data.data;
        setEmployees(list);
        
        // Auto-select based on navigation history or default to first employee
        const navigatedId = location.state?.preselectedId;
        if (navigatedId) {
          setSelectedEmpId(navigatedId);
          setActiveTab('single');
        } else if (list.length > 0) {
          setSelectedEmpId(list[0]._id);
        }

        // Initialize team checklist
        const initTeam = {};
        list.forEach(emp => {
          initTeam[emp._id] = false;
        });
        setTeamSelection(initTeam);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve employee list.');
    }
  };

  const handleSingleAudit = async () => {
    if (!selectedEmpId) return;
    setError('');
    setLoading(true);
    setSingleResult(null);

    try {
      const response = await api.post('/ai/recommend', { employeeId: selectedEmpId });
      if (response.data.success) {
        setSingleResult(response.data.recommendation);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate single AI audit report.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamRanking = async () => {
    const selectedIds = Object.keys(teamSelection).filter(id => teamSelection[id]);
    
    if (selectedIds.length < 2) {
      alert('Please check at least 2 employees to rank comparative metrics.');
      return;
    }

    setError('');
    setLoading(true);
    setMultipleResult(null);

    try {
      const response = await api.post('/ai/recommend', { employeeIds: selectedIds });
      if (response.data.success) {
        setMultipleResult(response.data.recommendation);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to compare and rank selected employees.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id) => {
    setTeamSelection(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectAllTeam = () => {
    const nextSelection = {};
    employees.forEach(emp => {
      nextSelection[emp._id] = true;
    });
    setTeamSelection(nextSelection);
  };

  const deselectAllTeam = () => {
    const nextSelection = {};
    employees.forEach(emp => {
      nextSelection[emp._id] = false;
    });
    setTeamSelection(nextSelection);
  };

  const getActiveEmployeeDetails = () => {
    return employees.find(emp => emp._id === selectedEmpId);
  };

  const getPriorityColor = (priority) => {
    if (priority?.toLowerCase() === 'high') return 'badge-rose';
    if (priority?.toLowerCase() === 'medium') return 'badge-yellow';
    return 'badge-teal';
  };

  const currentEmp = getActiveEmployeeDetails();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 className="page-title">AI Performance Recommendation Hub</h1>
        <p className="subtitle">Algorithmic promotion analysis, skill gap assessment, and team rankings powered by OpenRouter</p>
      </header>

      {/* Navigation Tab Bar */}
      <div style={styles.tabsContainer}>
        <button
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'single' ? styles.activeTabBtn : {})
          }}
          onClick={() => setActiveTab('single')}
        >
          🔬 Individual Performance Audit
        </button>
        <button
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'multiple' ? styles.activeTabBtn : {})
          }}
          onClick={() => setActiveTab('multiple')}
        >
          🥇 Team Comparative Leaderboard
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {/* TAB A: INDIVIDUAL ANALYSIS */}
      {activeTab === 'single' && (
        <div style={styles.panel}>
          <div className="card" style={styles.selectorCard}>
            <div style={styles.selectorRow}>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={styles.label}>SELECT EMPLOYEE TO AUDIT</label>
                <select
                  className="form-control"
                  value={selectedEmpId}
                  onChange={(e) => {
                    setSelectedEmpId(e.target.value);
                    setSingleResult(null);
                  }}
                  style={{ background: '#11141d' }}
                >
                  <option value="" disabled>-- Choose personnel --</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.department} | Score: {emp.performanceScore}%)
                    </option>
                  ))}
                </select>
              </div>
              <button 
                className="btn btn-primary" 
                style={styles.runBtn} 
                onClick={handleSingleAudit}
                disabled={loading || !selectedEmpId}
              >
                {loading ? 'Analyzing...' : 'Generate AI Performance Audit'}
              </button>
            </div>

            {currentEmp && (
              <div style={styles.empMiniDetails}>
                <div><strong>Dept:</strong> {currentEmp.department}</div>
                <div><strong>Experience:</strong> {currentEmp.experience} Years</div>
                <div><strong>Score:</strong> {currentEmp.performanceScore}%</div>
                <div>
                  <strong>Skills Matrix:</strong>{' '}
                  {currentEmp.skills.map((skill, idx) => (
                    <span key={idx} className="badge badge-purple" style={{ fontSize: '0.65rem', marginRight: '0.25rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div className="card ai-loader" style={{ marginTop: '2rem' }}>
              <div className="spinner"></div>
              <h3 className="pulse-text">AI Telemetry Scan in Progress...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Analyzing skill matrix, years of experience, and generating qualitative feedback.
              </p>
            </div>
          )}

          {singleResult && (
            <div style={styles.resultsGrid}>
              
              {/* Promotion eligibility card */}
              <div 
                className={`card ai-card ${singleResult.promotionRecommendation?.eligible ? 'eligible' : 'not-eligible'}`}
                style={styles.resultCard}
              >
                <div style={styles.cardSectionTitle}>
                  <span>🚀</span> PROMOTION EVALUATION AUDIT
                </div>
                <div style={styles.cardBadgeRow}>
                  {singleResult.promotionRecommendation?.eligible ? (
                    <span className="badge badge-emerald" style={styles.largeBadge}>
                      Recommended for Promotion
                    </span>
                  ) : (
                    <span className="badge badge-yellow" style={styles.largeBadge}>
                      Growth / Development Phase
                    </span>
                  )}
                </div>
                <p style={styles.cardJustification}>
                  {singleResult.promotionRecommendation?.justification}
                </p>
              </div>

              {/* Training suggestion card */}
              <div className="card ai-card" style={{ ...styles.resultCard, borderLeftColor: 'var(--accent-purple)' }}>
                <div style={styles.cardSectionTitle}>
                  <span>📚</span> TAILORED SKILL DEVELOPMENT PATH
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Identified skill development programs based on current department alignment:
                </p>
                <div style={styles.trainingList}>
                  {singleResult.trainingSuggestions?.map((item, idx) => (
                    <div key={idx} style={styles.trainingItem}>
                      <div style={styles.trainingHeader}>
                        <span style={styles.trainingSkill}>{item.skill}</span>
                        <span className={`badge ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                      <p style={styles.trainingSug}>{item.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback and Coaching card */}
              <div className="card ai-card" style={{ ...styles.resultCard, borderLeftColor: 'var(--accent-yellow)', gridColumn: '1 / -1' }}>
                <div style={styles.cardSectionTitle}>
                  <span>📝</span> QUALITATIVE FEEDBACK &amp; COACHING AUDIT
                </div>
                
                <div style={styles.feedbackSplit}>
                  <div style={styles.feedbackCol}>
                    <h5 style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>KEY PERFORMANCE STRENGTHS</h5>
                    {singleResult.feedback?.strengths?.map((str, idx) => (
                      <div key={idx} className="ai-bullet">
                        <span className="ai-bullet-icon" style={{ color: 'var(--accent-emerald)' }}>✔</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{str}</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.feedbackCol}>
                    <h5 style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>COACHING &amp; GROWTH AREAS</h5>
                    {singleResult.feedback?.improvements?.map((imp, idx) => (
                      <div key={idx} className="ai-bullet">
                        <span className="ai-bullet-icon" style={{ color: 'var(--accent-rose)' }}>▴</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.executiveSummary}>
                  <h5 style={{ color: 'white', fontSize: '0.85rem', marginBottom: '0.4rem' }}>EXECUTIVE DIRECTOR SUMMARY</h5>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.6' }}>
                    "{singleResult.feedback?.summary}"
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB B: TEAM RANKINGS */}
      {activeTab === 'multiple' && (
        <div style={styles.panel}>
          <div style={styles.rankingContainer}>
            
            {/* Checklist panel */}
            <div className="card" style={styles.checklistCard}>
              <div style={styles.checklistHeader}>
                <h4 style={{ fontSize: '0.95rem' }}>SELECT CO-WORKERS TO RANK</h4>
                <div style={styles.batchBtnRow}>
                  <span style={styles.batchBtn} onClick={selectAllTeam}>All</span>
                  <span style={styles.batchDivider}>|</span>
                  <span style={styles.batchBtn} onClick={deselectAllTeam}>None</span>
                </div>
              </div>

              <div style={styles.checklistList}>
                {employees.map(emp => (
                  <label key={emp._id} style={styles.checkItem}>
                    <input
                      type="checkbox"
                      checked={!!teamSelection[emp._id]}
                      onChange={() => handleCheckboxChange(emp._id)}
                      style={styles.checkbox}
                    />
                    <div style={styles.checkDetails}>
                      <span style={styles.checkName}>{emp.name}</span>
                      <span style={styles.checkMeta}>{emp.department} | Score: {emp.performanceScore}%</span>
                    </div>
                  </label>
                ))}
              </div>

              <button 
                className="btn btn-primary" 
                style={styles.rankBtn} 
                onClick={handleTeamRanking}
                disabled={loading || Object.keys(teamSelection).filter(id => teamSelection[id]).length < 2}
              >
                {loading ? 'Ranking...' : '🏆 Rank Selected Team'}
              </button>
            </div>

            {/* Rankings results panel */}
            <div style={{ flex: 2 }}>
              {loading && (
                <div className="card ai-loader" style={{ height: '100%' }}>
                  <div className="spinner"></div>
                  <h3 className="pulse-text">Assembling Leaderboard Data...</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                    Comparing experience parameters, relative scores, and drafting executive leaderboard suggestions.
                  </p>
                </div>
              )}

              {!loading && !multipleResult && (
                <div className="card" style={styles.placeholderRank}>
                  <span style={{ fontSize: '3rem' }}>🏅</span>
                  <h3>AI Leaderboard Matrix</h3>
                  <p>Tick two or more employees in the team checklist on the left and click 'Rank Selected Team' to generate ranked standing insights.</p>
                </div>
              )}

              {!loading && multipleResult && (
                <div style={styles.leaderboardWrapper}>
                  <div className="card" style={styles.rankHeaderCard}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>🏆 AI Ranking Leaderboard</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Comparative telemetry sorting employees by operational output and potential.
                    </p>
                  </div>

                  <div style={styles.rankList}>
                    {multipleResult.rankings?.map((item) => (
                      <div className="card" key={item.employeeId} style={styles.rankRowCard}>
                        <div style={styles.rankBadgeCol}>
                          <span style={styles.rankNumberBadge}>#{item.rank}</span>
                        </div>
                        
                        <div style={styles.rankMainCol}>
                          <h4 style={{ fontSize: '1.05rem', color: 'white' }}>{item.name}</h4>
                          <div style={styles.rankMetaRow}>
                            <span>Telemetry Score: <strong>{item.score}%</strong></span>
                            <span>•</span>
                            <span>Experience: <strong>{item.experience} yrs</strong></span>
                          </div>
                          <p style={styles.rankReason}>{item.reason}</p>
                        </div>

                        <div style={styles.rankActionCol}>
                          <span className={`badge ${
                            item.promotionRecommendation === 'Promote Now' ? 'badge-emerald' :
                            item.promotionRecommendation === 'Growth Watchlist' ? 'badge-yellow' :
                            'badge-rose'
                          }`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>
                            {item.promotionRecommendation}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {multipleResult.overallSummary && (
                    <div className="card" style={styles.execSummaryCard}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', marginBottom: '0.5rem', fontWeight: '700' }}>
                        EXECUTIVE SUMMARY &amp; STRATEGIC DISPATCH:
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', fontStyle: 'italic' }}>
                        "{multipleResult.overallSummary}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  header: {
    marginBottom: '2rem',
  },
  tabsContainer: {
    display: 'flex',
    gap: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '0.75rem',
    marginBottom: '2rem',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    fontWeight: '600',
    padding: '0.6rem 1.2rem',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'var(--transition-fast)',
  },
  activeTabBtn: {
    color: 'white',
    background: 'rgba(99, 102, 241, 0.1)',
    boxShadow: '0 0 15px -3px rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
  },
  panel: {
    animation: 'fadeIn 0.4s ease',
  },
  errorAlert: {
    background: 'rgba(244, 63, 94, 0.12)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    color: '#f87171',
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  selectorCard: {
    background: 'rgba(22, 27, 38, 0.4)',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  selectorRow: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  runBtn: {
    padding: '0.75rem 1.5rem',
    minHeight: '44px',
  },
  empMiniDetails: {
    display: 'flex',
    gap: '2rem',
    marginTop: '1.25rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    flexWrap: 'wrap',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem',
    animation: 'slideUp 0.4s ease',
  },
  resultCard: {
    background: 'rgba(22, 27, 38, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  cardSectionTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '0.08em',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.5rem',
  },
  cardBadgeRow: {
    marginTop: '0.25rem',
  },
  largeBadge: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
  },
  cardJustification: {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: 'var(--text-secondary)',
  },
  trainingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  trainingItem: {
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  trainingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.35rem',
  },
  trainingSkill: {
    fontWeight: '700',
    color: 'white',
    fontSize: '0.9rem',
  },
  trainingSug: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  feedbackSplit: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  feedbackCol: {
    flex: 1,
    minWidth: '280px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  executiveSummary: {
    marginTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1rem',
  },
  rankingContainer: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  checklistCard: {
    flex: 1,
    minWidth: '280px',
    maxWidth: '380px',
    background: 'rgba(22, 27, 38, 0.5)',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  checklistHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
  },
  batchBtnRow: {
    display: 'flex',
    gap: '0.4rem',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  batchBtn: {
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'var(--transition-fast)',
  },
  batchDivider: {
    color: 'var(--text-muted)',
  },
  checklistList: {
    maxHeight: '350px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    paddingRight: '0.25rem',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.8rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  checkbox: {
    accentColor: 'var(--accent-indigo)',
    width: '16px',
    height: '16px',
  },
  checkDetails: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.3',
  },
  checkName: {
    fontWeight: '700',
    fontSize: '0.9rem',
    color: 'white',
  },
  checkMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  rankBtn: {
    width: '100%',
    padding: '0.75rem',
    marginTop: '0.5rem',
  },
  placeholderRank: {
    height: '100%',
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '3rem 2rem',
    color: 'var(--text-secondary)',
    gap: '1rem',
  },
  leaderboardWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    animation: 'slideUp 0.4s ease',
  },
  rankHeaderCard: {
    background: 'rgba(139, 92, 246, 0.08)',
    border: '1px solid rgba(139, 92, 246, 0.15)',
  },
  rankList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  rankRowCard: {
    background: 'rgba(22, 27, 38, 0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1.25rem 1.5rem',
  },
  rankBadgeCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumberBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.1rem',
    color: 'var(--accent-purple)',
    boxShadow: '0 0 10px rgba(139, 92, 246, 0.15)',
  },
  rankMainCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  rankMetaRow: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  rankReason: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginTop: '0.25rem',
  },
  rankActionCol: {
    display: 'flex',
    alignItems: 'center',
  },
  execSummaryCard: {
    background: 'rgba(22, 27, 38, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '1.25rem 1.5rem',
  },
};

export default Recommendations;
