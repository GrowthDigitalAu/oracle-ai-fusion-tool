import React, { useEffect, useState, useRef } from 'react';
import { CircleUser, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Helper to decode JWT
    const parseJwt = (token) => {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        return null;
      }
    };

    try {
      const adminToken = localStorage.getItem('adminToken');
      const orgToken = localStorage.getItem('orgToken');
      const storedAdmin = localStorage.getItem('adminUser');
      const storedOrgUser = localStorage.getItem('orgUser');
      
      if (adminToken && storedAdmin) {
        const decoded = parseJwt(adminToken);
        const role = decoded?.role || 'Admin'; // Fallback to 'Admin'
        setUser({ ...JSON.parse(storedAdmin), roleType: role });
      } else if (orgToken && storedOrgUser) {
        const decoded = parseJwt(orgToken);
        const role = decoded?.role || 'User'; // Fallback to 'User'
         setUser({ ...JSON.parse(storedOrgUser), roleType: role });
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear all potential auth items
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('orgToken');
    localStorage.removeItem('orgUser');
    
    // Determine redirect based on who was logged in (optional, but for now defaults to admin login or we can check which one existed)
    // A simple approach is to just redirect to one login or reload.
    // Let's redirect to admin-login by default, or maybe organization-login if we knew they were an org user.
    // But since we just cleared everything, let's just go to a neutral place or admin-login.
    navigate('/admin-login'); 
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="app-header" style={{
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '0 2rem',
      height: '64px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #eaeaea',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      marginBottom: '1rem',
      position: 'relative' // Needed for absolute positioning of dropdown
    }}>
      <div 
        ref={dropdownRef}
        style={{ position: 'relative', cursor: 'pointer' }}
        onClick={toggleDropdown}
      >
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CircleUser size={32} color="#555" />
            <span style={{ fontWeight: '500', color: '#333' }}>
              {user.full_name || user.email} ({user.roleType})
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <CircleUser size={32} color="#555" />
            <span style={{ fontWeight: '500', color: '#333' }}>Guest</span>
          </div>
        )}

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            backgroundColor: 'white',
            border: '1px solid #eaeaea',
            borderRadius: '4px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            padding: '0.5rem',
            minWidth: '150px',
            zIndex: 1000
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent toggling dropdown again
                handleLogout();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#333',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
