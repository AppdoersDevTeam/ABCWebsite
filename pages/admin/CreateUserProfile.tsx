import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';

interface CreateUserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserProfile: React.FC<CreateUserProfileProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // First, try to find the user in auth by email
      // Note: We can't directly query auth.users from client, so we'll create with a placeholder ID
      // The actual ID should match the auth.users.id
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (existingUser) {
        setError('User with this email already exists in the database');
        setIsCreating(false);
        return;
      }

      // For now, we'll need to get the actual user ID from Supabase Dashboard
      // Or we can create a server-side function to do this
      // For the manual creation, we'll prompt for the ID
      
      const userId = prompt('Enter the user ID from Supabase auth.users table (you can find this in Supabase Dashboard > Authentication > Users):');
      
      if (!userId) {
        setError('User ID is required');
        setIsCreating(false);
        return;
      }

      // Check if this ID already exists
      const { data: existingById } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingById) {
        setError('User with this ID already exists');
        setIsCreating(false);
        return;
      }

      const fName = firstName || email.split('@')[0];
      const lName = lastName || '';
      const newUser: User = {
        id: userId,
        email: email.toLowerCase(),
        phone: phone || undefined,
        first_name: fName,
        last_name: lName,
        name: [fName, lName].filter(Boolean).join(' '),
        is_approved: false,
        role: 'member',
      };

      const { data, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user:', insertError);
        setError(insertError.message || 'Failed to create user profile');
        throw insertError;
      }

      console.log('User profile created:', data);
      alert('User profile created successfully! They can now be approved.');
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhone('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating user profile:', err);
      setError(err.message || 'Failed to create user profile');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create User Profile">
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-[4px] text-sm text-yellow-800">
          <p className="font-bold mb-1">Note:</p>
          <p>You'll need the user's ID from Supabase Dashboard (Authentication → Users). This is needed to link the profile to their auth account.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[4px] text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-charcoal mb-2">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
            placeholder="user@example.com"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="John"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-charcoal mb-2">Phone (Optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
            placeholder="+1234567890"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          <GlowingButton onClick={handleCreate} disabled={isCreating || !email || !firstName}>
            {isCreating ? 'Creating...' : 'Create Profile'}
          </GlowingButton>
        </div>
      </div>
    </Modal>
  );
};


