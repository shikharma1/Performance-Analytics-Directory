import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';

const EmployeeForm = ({ employee, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Development');
  const [skillsStr, setSkillsStr] = useState('');
  const [performanceScore, setPerformanceScore] = useState(80);
  const [experience, setExperience] = useState(2);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditMode = !!employee;

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setEmail(employee.email || '');
      setDepartment(employee.department || 'Development');
      setSkillsStr(employee.skills ? employee.skills.join(', ') : '');
      setPerformanceScore(employee.performanceScore !== undefined ? employee.performanceScore : 80);
      setExperience(employee.experience !== undefined ? employee.experience : 2);
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic Form validation
    if (!name.trim() || !email.trim() || !department.trim() || !skillsStr.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Split skills string into a parsed array of trimmed strings
    const skills = skillsStr
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    if (skills.length === 0) {
      setError('Please add at least one skill');
      setLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      skills,
      performanceScore: Number(performanceScore),
      experience: Number(experience),
    };

    try {
      let response;
      if (isEditMode) {
        // PUT /api/employees/:id
        response = await api.put(`/employees/${employee._id}`, payload);
      } else {
        // POST /api/employees
        response = await api.post('/employees', payload);
      }

      if (response.data.success) {
        onSave(response.data.data, isEditMode);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong saving the employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={styles.modal}>
        <div style={styles.header}>
          <h3>{isEditMode ? 'Modify Employee Profile' : 'Register New Employee'}</h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label>EMPLOYEE FULL NAME *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Aman Verma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>EMAIL ADDRESS *</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. aman@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>DEPARTMENT *</label>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={styles.select}
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Product">Product</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>EXPERIENCE (YEARS) *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>SKILLS (COMMA SEPARATED) *</label>
            <input
              type="text"
              className="form-control"
              placeholder="React, Node.js, MongoDB, Express"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={styles.scoreHeader}>
              <label>PERFORMANCE SCORE *</label>
              <span style={styles.scoreVal}>{performanceScore} / 100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={performanceScore}
              onChange={(e) => setPerformanceScore(e.target.value)}
              style={styles.rangeSlider}
            />
            <div style={styles.rangeLabels}>
              <span>Needs Improvement</span>
              <span>Average</span>
              <span>Excellent</span>
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving Data...' : isEditMode ? 'Update Details' : 'Register Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  modal: {
    padding: '2rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '2rem',
    cursor: 'pointer',
    lineHeight: '0.5',
    transition: 'var(--transition-fast)',
  },
  errorAlert: {
    background: 'rgba(244, 63, 94, 0.15)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    color: '#f87171',
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  row: {
    display: 'flex',
    gap: '1rem',
  },
  select: {
    background: '#11141d',
  },
  scoreHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreVal: {
    color: 'var(--accent-purple)',
    fontWeight: '700',
    fontSize: '1rem',
    textShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
  },
  rangeSlider: {
    width: '100%',
    cursor: 'pointer',
    accentColor: 'var(--accent-indigo)',
  },
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.2rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '1.25rem',
  },
};

export default EmployeeForm;
