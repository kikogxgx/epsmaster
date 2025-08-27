import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, BookOpen, CalendarX } from 'lucide-react';

const menu = [
  { path: '/',          label: 'Dashboard',   icon: Home       },
  { path: '/classes',   label: 'Classes',     icon: Users      },
  { path: '/cycles',    label: 'Cycles',      icon: BookOpen   },
  { path: '/absences-prof', label: 'Absences Prof', icon: CalendarX }
];

const Sidebar: React.FC = () => (
  <div className="bg-white shadow-lg h-screen w-64 fixed left-0 top-0 z-40">
    <div className="p-6 border-b border-neutral-100">
      <h1 className="text-xl font-bold text-neutral-800">Application EPS</h1>
    </div>
    <nav className="mt-6">
      {menu.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
              isActive ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600' : ''
            }`
          }
        >
          <item.icon className="w-5 h-5 mr-3" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  </div>
);

export default Sidebar;
