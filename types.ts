import React from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  is_approved: boolean;
  role: 'member' | 'admin';
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export interface RosterMember {
  id: string;
  name: string;
  role: string;
  date: string;
  status: 'confirmed' | 'pending' | 'declined';
  team: 'Worship' | 'Tech' | 'Welcome' | 'Kids';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
}