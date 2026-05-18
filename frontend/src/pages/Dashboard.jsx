import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import EmployeeForm from '../components/EmployeeForm';

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [minExp, setMinExp] = useState(0);
  
  // View Toggle (Table vs Cards)
  const [viewMode, setViewMode] = useState('table');
  
  // Modal controllers
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const navigate = useNavigate();

  // Load all employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Trigger search whenever search inputs change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, deptFilter, minScore, maxScore, minExp]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees');
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve employee list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let queryParams = [];
      if (deptFilter && deptFilter !== 'All') queryParams.push(`department=${deptFilter}`);
      if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
      if (minScore > 0) queryParams.push(`minScore=${minScore}`);
      if (maxScore < 100) queryParams.push(`maxScore=${maxScore}`);
      if (minExp > 0) queryParams.push(`minExperience=${minExp}`);

      const queryStr = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const response = await api.get(`/employees/search${queryStr}`);
      
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Search parameters failed to resolve.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const response = await api.delete(`/employees/${id}`);
        if (response.data.success) {
          setEmployees(employees.filter(emp => emp._id !== id));
        }
      } catch (err) {
        console.error(err);
        alert('Failed to remove employee.');
      }
    }
  };

  const handleSaveSuccess = (savedEmployee, isEdit) => {
    if (isEdit) {
      setEmployees(employees.map(emp => emp._id === savedEmployee._id ? savedEmployee : emp));
    } else {
      setEmployees([savedEmployee, ...employees]);
    }
  };

  const openAddModal = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  // Compile quick KPIs / Metrics
  const totalCount = employees.length;
  const avgScore = totalCount > 0 
    ? Math.round(employees.reduce((acc, curr) => acc + curr.performanceScore, 0) / totalCount) 
    : 0;
  const promotionCandidates = employees.filter(emp => emp.performanceScore >= 80 && emp.experience >= 3).length;

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--accent-emerald)';
    if (score >= 50) return 'var(--accent-yellow)';
    return 'var(--accent-rose)';
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 className="page-title">Performance Analytics Directory</h1>
          <p className="subtitle">Real-time analysis and operational telemetry of organizational skills</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Register Employee
        </button>
      </header>

      {/* Analytics KPI Row */}
      <section className="metrics-row">
        <div className="card" style={styles.metricCard}>
          <div style={styles.metricLabel}>TOTAL HEADCOUNT</div>
          <div style={styles.metricVal} className="glow-text">{totalCount}</div>
          <div style={styles.metricIndicator}>Active personnel database</div>
        </div>
        
        <div className="card" style={styles.metricCard}>
          <div style={styles.metricLabel}>AVERAGE PERFORMANCE</div>
          <div style={styles.metricVal} style={{ ...styles.metricVal, color: getScoreColor(avgScore) }}>
            {avgScore}%
          </div>
          <div className="score-meter-container" style={{ height: '6px', margin: '0.5rem 0 0.25rem 0' }}>
            <div 
              className="score-meter-fill" 
              style={{ width: `${avgScore}%`, backgroundColor: getScoreColor(avgScore) }}
            />
          </div>
          <div style={styles.metricIndicator}>Company average telemetry</div>
        </div>

        <div className="card" style={styles.metricCard}>
          <div style={styles.metricLabel}>PROMOTABLE TALENT</div>
          <div style={styles.metricVal} style={{ ...styles.metricVal, color: 'var(--accent-purple)' }}>
            {promotionCandidates}
          </div>
          <div style={styles.metricIndicator}>Score &ge; 80% &amp; experience &ge; 3 yrs</div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="card" style={styles.filterSection}>
        <div style={styles.filterRow1}>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={styles.label}>SEARCH BY KEYWORD</label>
            <input
              type="text"
              className="form-control"
              placeholder="Filter by name, email, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={styles.label}>DEPARTMENT</label>
            <select
              className="form-control"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ background: '#11141d' }}
            >
              <option value="All">All Departments</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Product">Product</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <button 
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('table')}
              style={styles.toggleBtn}
              title="Table View"
            >
              ☷ Table
            </button>
            <button 
              className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('cards')}
              style={styles.toggleBtn}
              title="Grid View"
            >
              ⚃ Cards
            </button>
          </div>
        </div>

        <div style={styles.filterRow2}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={styles.sliderHeader}>
              <label style={styles.label}>MIN SCORE</label>
              <span style={styles.valIndicator}>{minScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              style={{ accentColor: 'var(--accent-indigo)' }}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={styles.sliderHeader}>
              <label style={styles.label}>MAX SCORE</label>
              <span style={styles.valIndicator}>{maxScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              style={{ accentColor: 'var(--accent-indigo)' }}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={styles.sliderHeader}>
              <label style={styles.label}>MIN EXPERIENCE (YEARS)</label>
              <span style={styles.valIndicator}>{minExp} yrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={minExp}
              onChange={(e) => setMinExp(Number(e.target.value))}
              style={{ accentColor: 'var(--accent-indigo)' }}
            />
          </div>
        </div>
      </section>

      {/* Directory List Container */}
      {loading && employees.length === 0 ? (
        <div className="ai-loader">
          <div className="spinner"></div>
          <p className="pulse-text">Syncing organizational records...</p>
        </div>
      ) : error ? (
        <div style={styles.errorBanner}>{error}</div>
      ) : employees.length === 0 ? (
        <div className="card" style={styles.emptyCard}>
          <span style={{ fontSize: '2.5rem' }}>📭</span>
          <h3>No Employee Records Found</h3>
          <p>Try modifying your search queries or add a new record to the workspace.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE DIRECTORY */
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Experience</th>
                <th>Skills Matrix</th>
                <th>Score</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <div style={styles.tableName}>{emp.name}</div>
                    <div style={styles.tableEmail}>{emp.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-indigo">{emp.department}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600' }}>{emp.experience}</span> years
                  </td>
                  <td>
                    <div style={styles.skillsList}>
                      {emp.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                          {skill}
                        </span>
                      ))}
                      {emp.skills.length > 3 && (
                        <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>
                          +{emp.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ width: '180px' }}>
                    <div style={styles.tableScoreRow}>
                      <span style={{ fontWeight: '700', color: getScoreColor(emp.performanceScore) }}>
                        {emp.performanceScore}%
                      </span>
                      <div className="score-meter-container">
                        <div 
                          className="score-meter-fill" 
                          style={{ width: `${emp.performanceScore}%`, backgroundColor: getScoreColor(emp.performanceScore) }}
                        />
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={styles.actionCell}>
                      <button 
                        className="btn btn-success" 
                        style={styles.actionBtn}
                        onClick={() => navigate('/recommendations', { state: { preselectedId: emp._id } })}
                      >
                        AI Audit
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={styles.actionBtn}
                        onClick={() => openEditModal(emp)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={styles.actionBtn}
                        onClick={() => handleDelete(emp._id, emp.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARD DIRECTORY */
        <div className="dashboard-grid">
          {employees.map((emp) => (
            <article className="card" key={emp._id} style={styles.employeeCard}>
              <div style={styles.cardHeader}>
                <div style={styles.cardAvatar}>
                  {emp.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                </div>
                <div>
                  <h4 style={styles.cardName}>{emp.name}</h4>
                  <span style={styles.cardEmail}>{emp.email}</span>
                </div>
              </div>

              <div style={styles.cardMeta}>
                <span className="badge badge-indigo">{emp.department}</span>
                <span style={styles.cardExp}>{emp.experience} Years Exp</span>
              </div>

              <div style={styles.cardScoreBlock}>
                <div style={styles.cardScoreHeader}>
                  <span>Performance score</span>
                  <span style={{ color: getScoreColor(emp.performanceScore), fontWeight: '700' }}>
                    {emp.performanceScore}%
                  </span>
                </div>
                <div className="score-meter-container">
                  <div 
                    className="score-meter-fill" 
                    style={{ width: `${emp.performanceScore}%`, backgroundColor: getScoreColor(emp.performanceScore) }}
                  />
                </div>
              </div>

              <div style={styles.cardSkillsBlock}>
                <span style={styles.skillsHeading}>SKILLS REGISTER:</span>
                <div style={styles.cardSkills}>
                  {emp.skills.map((skill, idx) => (
                    <span key={idx} className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div style={styles.cardActions}>
                <button 
                  className="btn btn-success" 
                  style={{ flex: 1.5, padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => navigate('/recommendations', { state: { preselectedId: emp._id } })}
                >
                  AI Audit Insights
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                  onClick={() => openEditModal(emp)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger" 
                  style={{ flex: 0.5, padding: '0.5rem', fontSize: '0.8rem' }}
                  onClick={() => handleDelete(emp._id, emp.name)}
                >
                  🗑
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Registration/Modification Modal */}
      {showModal && (
        <EmployeeForm
          employee={selectedEmployee}
          onClose={() => setShowModal(false)}
          onSave={handleSaveSuccess}
        />
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    gap: '1rem',
  },
  metricCard: {
    background: 'rgba(17, 20, 29, 0.6)',
    padding: '1.25rem 1.5rem',
  },
  metricLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  metricVal: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'white',
    margin: '0.2rem 0',
  },
  metricIndicator: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  filterSection: {
    background: 'rgba(22, 27, 38, 0.4)',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    padding: '1.5rem',
  },
  filterRow1: {
    display: 'flex',
    gap: '1.25rem',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  filterRow2: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '1rem',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valIndicator: {
    fontSize: '0.75rem',
    color: 'var(--accent-purple)',
    fontWeight: '700',
  },
  toggleBtn: {
    padding: '0.65rem 1rem',
    fontSize: '0.85rem',
    minWidth: '90px',
  },
  errorBanner: {
    background: 'rgba(244, 63, 94, 0.1)',
    color: '#f87171',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyCard: {
    textAlign: 'center',
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  tableName: {
    fontWeight: '700',
    color: 'white',
  },
  tableEmail: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  skillsList: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
  },
  tableScoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  actionCell: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.4rem',
  },
  actionBtn: {
    padding: '0.45rem 0.8rem',
    fontSize: '0.8rem',
  },
  employeeCard: {
    background: 'rgba(22, 27, 38, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  cardAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1rem',
    color: 'var(--accent-purple)',
  },
  cardName: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'white',
  },
  cardEmail: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardExp: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  cardScoreBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  cardScoreHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
  },
  cardSkillsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  skillsHeading: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  cardSkills: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1rem',
    marginTop: 'auto',
  },
};

export default Dashboard;
