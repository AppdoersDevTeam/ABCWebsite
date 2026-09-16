import React from 'react';
import { HelpContent } from '../../components/Help/HelpContent';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdminUser } from '../../lib/constants';

export const AdminHelp = () => {
  const { user } = useAuth();
  return <HelpContent mode="admin" isSuperAdmin={isSuperAdminUser(user)} />;
};

