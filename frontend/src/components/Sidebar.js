import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, User, UserCog, Folder, ChevronRight, ChevronDown } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (name) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Decode Token to get Role
  const getTokenRole = () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const orgToken = localStorage.getItem('orgToken');
      const token = adminToken || orgToken;
      
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role; // 'Admin' or 'User'
    } catch (e) {
      return null;
    }
  };

  const role = getTokenRole();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Organization', icon: <Building2 size={20} />, path: '/organization', roles: ['Admin'] },
    { name: 'User', icon: <User size={20} />, path: '/user' }, // Visible to all for now, or update if needed
    { name: 'Projects', icon: <Folder size={20} />, path: '/projects', hideForRoles: ['Admin'] },
    { 
      name: 'Roles Management', 
      icon: <UserCog size={20} />, 
      hideForRoles: ['Admin'],
      subItems: [
        { name: 'Roles', icon: <User size={18} />, path: '/roles' },
        { name: 'Permissions', icon: <UserCog size={18} />, path: '/permissions' },
        { name: 'User Roles', icon: <User size={18} />, path: '/user-roles' }
      ]
    },
  ];

  // Filter items based on role
  const filteredItems = menuItems.filter(item => {
    if (item.hideForRoles && item.hideForRoles.includes(role)) return false; // Hide if role is in hideForRoles
    if (!item.roles) return true; // Show if no specific roles defined
    return item.roles.includes(role);
  });

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="header-title">MAIN MENU</span>
      </div>
      <nav>
        <ul className="menu-list">
          {filteredItems.map((item) => {
            if (item.subItems) {
              const isExpanded = openMenus[item.name];
              const isActiveParent = item.subItems.some(sub => location.pathname === sub.path);

              return (
                <li key={item.name} className={isActiveParent ? 'has-submenu active-parent' : 'has-submenu'}>
                  <div 
                    className={`menu-item ${isActiveParent ? 'active' : ''}`} 
                    onClick={() => toggleMenu(item.name)}
                    style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="icon">{item.icon}</span>
                      <span className="label">{item.name}</span>
                    </div>
                    <span>{isExpanded ? '▼' : '▶'}</span>
                  </div>
                  {isExpanded && (
                    <ul className="submenu-list" style={{ paddingLeft: '20px', background: 'rgba(0,0,0,0.1)' }}>
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <NavLink
                            to={subItem.path}
                            className={({ isActive }) =>
                              isActive ? 'menu-item active' : 'menu-item'
                            }
                            style={{ paddingLeft: '15px', fontSize: '0.95em' }}
                          >
                            <span className="icon">{subItem.icon}</span>
                            <span className="label">{subItem.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? 'menu-item active' : 'menu-item'
                  }
                >
                  <span className="icon">{item.icon}</span>
                  <span className="label">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
