import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, User, UserCog } from 'lucide-react';

const Sidebar = () => {
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
    { name: 'Roles', icon: <UserCog size={20} />, path: '/roles' },
  ];

  // Filter items based on role
  const filteredItems = menuItems.filter(item => {
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
          {filteredItems.map((item) => (
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
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
