import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, UserCheck, X, Shield, ShieldOff, Ban, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { CreateUserProfile } from './CreateUserProfile';
import { SkeletonPageHeader, SkeletonStatsCard, SkeletonUserCard } from '../../components/UI/Skeleton';

export const AdminUsers = () => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'admins'>('all');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    console.log('AdminUsers - fetchUsers called');
    setIsLoadingUsers(true);
    try {
      console.log('AdminUsers - Making Supabase query for all users');
      
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('AdminUsers - All users in database:', allUsers);
      if (allUsersError) {
        console.error('AdminUsers - Error fetching all users:', allUsersError);
        throw allUsersError;
      }

      const { data: pendingData, error: pendingError } = await supabase
        .from('users')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error('AdminUsers - Error fetching pending users:', pendingError);
      }

      setAllUsers(allUsers || []);
      setPendingUsers(pendingData || []);
      setPendingCount(pendingData?.length || 0);
      console.log('AdminUsers - Set users:', allUsers?.length || 0);
    } catch (error) {
      console.error('AdminUsers - Error fetching users:', error);
      setAllUsers([]);
      setPendingUsers([]);
      setPendingCount(0);
    } finally {
      setIsLoadingUsers(false);
      console.log('AdminUsers - fetchUsers completed');
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to approve this user?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;
      alert('User approved successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reject this user? They will need to sign up again.')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;
      alert('User rejected and removed');
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    }
  };

  const handleRevokeApproval = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to revoke approval for ${userName}? They will lose access to the website.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_approved: false })
        .eq('id', userId);

      if (error) throw error;
      alert('User approval revoked successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error revoking approval:', error);
      alert('Failed to revoke approval');
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'member', userName: string) => {
    const action = newRole === 'admin' ? 'grant admin privileges to' : 'revoke admin privileges from';
    if (!window.confirm(`Are you sure you want to ${action} ${userName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      alert(`User role updated successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Failed to change user role');
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  const filteredUsers = () => {
    switch (filter) {
      case 'pending':
        return allUsers.filter(u => !u.is_approved);
      case 'approved':
        return allUsers.filter(u => u.is_approved);
      case 'admins':
        return allUsers.filter(u => u.role === 'admin');
      default:
        return allUsers;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal">User Management</h1>
          <p className="text-neutral mt-1">Manage user roles, permissions, and approvals</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gold text-charcoal px-6 py-3 rounded-[4px] font-bold hover:bg-gold/80 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          Create User Profile
        </button>
      </div>

      {/* Stats Cards */}
      {isLoadingUsers ? (
        <div className="grid md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 p-6 rounded-[8px] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral font-bold">Total Users</p>
                <p className="text-3xl font-bold text-charcoal mt-2">{allUsers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-[8px] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral font-bold">Pending Approval</p>
                <p className="text-3xl font-bold text-gold mt-2">{pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <UserCheck size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-[8px] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral font-bold">Approved Users</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{allUsers.filter(u => u.is_approved).length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-[8px] shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral font-bold">Admins</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{allUsers.filter(u => u.role === 'admin').length}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Shield size={24} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 font-bold transition-colors ${
            filter === 'all'
              ? 'text-charcoal border-b-2 border-gold'
              : 'text-neutral hover:text-charcoal'
          }`}
        >
          All Users ({allUsers.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-3 font-bold transition-colors ${
            filter === 'pending'
              ? 'text-charcoal border-b-2 border-gold'
              : 'text-neutral hover:text-charcoal'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-6 py-3 font-bold transition-colors ${
            filter === 'approved'
              ? 'text-charcoal border-b-2 border-gold'
              : 'text-neutral hover:text-charcoal'
          }`}
        >
          Approved ({allUsers.filter(u => u.is_approved).length})
        </button>
        <button
          onClick={() => setFilter('admins')}
          className={`px-6 py-3 font-bold transition-colors ${
            filter === 'admins'
              ? 'text-charcoal border-b-2 border-gold'
              : 'text-neutral hover:text-charcoal'
          }`}
        >
          Admins ({allUsers.filter(u => u.role === 'admin').length})
        </button>
      </div>

      {/* Users List */}
      {isLoadingUsers ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonUserCard key={i} />
          ))}
        </div>
      ) : filteredUsers().length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[8px] border border-gray-200">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-neutral text-lg font-medium">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers().map((u) => (
            <div
              key={u.id}
              className="bg-white border-2 border-gray-200 p-6 rounded-[8px] hover:border-blue-300 transition-all shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-xl text-charcoal">{u.name}</h3>
                        {u.role === 'admin' && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded uppercase font-bold flex items-center gap-1">
                            <Shield size={12} />
                            Admin
                          </span>
                        )}
                        {u.is_approved ? (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded uppercase font-bold">
                            Approved
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded uppercase font-bold">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {u.email && (
                          <p className="text-sm text-neutral flex items-center gap-2">
                            <span className="font-bold">Email:</span> {u.email}
                          </p>
                        )}
                        {u.phone && (
                          <p className="text-sm text-neutral flex items-center gap-2">
                            <span className="font-bold">Phone:</span> {u.phone}
                          </p>
                        )}
                        {u.created_at && (
                          <p className="text-xs text-neutral flex items-center gap-2 mt-2">
                            <span className="font-bold">Joined:</span> {formatDate(u.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap flex-shrink-0">
                  {/* Role Management */}
                  {u.role === 'admin' ? (
                    <button
                      onClick={() => handleChangeRole(u.id, 'member', u.name)}
                      className="bg-orange-100 border-2 border-orange-300 text-orange-700 px-4 py-2 rounded-[4px] font-bold hover:bg-orange-200 transition-colors shadow-sm flex items-center gap-2 text-sm"
                      title="Revoke admin privileges"
                    >
                      <ShieldOff size={16} />
                      Remove Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => handleChangeRole(u.id, 'admin', u.name)}
                      className="bg-purple-100 border-2 border-purple-300 text-purple-700 px-4 py-2 rounded-[4px] font-bold hover:bg-purple-200 transition-colors shadow-sm flex items-center gap-2 text-sm"
                      title="Grant admin privileges"
                    >
                      <Shield size={16} />
                      Make Admin
                    </button>
                  )}
                  
                  {/* Approval Management */}
                  {u.is_approved ? (
                    <button
                      onClick={() => handleRevokeApproval(u.id, u.name)}
                      className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-2 rounded-[4px] font-bold hover:bg-red-200 transition-colors shadow-sm flex items-center gap-2 text-sm"
                      title="Revoke user approval"
                    >
                      <Ban size={16} />
                      Revoke Access
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApproveUser(u.id)}
                      className="bg-gold text-charcoal px-4 py-2 rounded-[4px] font-bold hover:bg-gold/80 transition-colors shadow-sm flex items-center gap-2 text-sm"
                      title="Approve user"
                    >
                      <UserCheck size={16} />
                      Approve
                    </button>
                  )}

                  {/* Reject Button (only for pending users) */}
                  {!u.is_approved && (
                    <button
                      onClick={() => handleRejectUser(u.id)}
                      className="bg-white border-2 border-red-200 text-red-600 px-4 py-2 rounded-[4px] font-bold hover:bg-red-50 transition-colors shadow-sm flex items-center gap-2 text-sm"
                      title="Reject and delete user"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create User Profile Modal */}
      <CreateUserProfile
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
        }}
      />
    </div>
  );
};

