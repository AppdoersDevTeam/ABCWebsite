import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types';
import { Modal } from '../../components/UI/Modal';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { displayName } from '../../lib/constants';
import { Search, Link2, Unlink } from 'lucide-react';

type DirRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  user_id: string | null;
};

interface LinkDirectoryUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  onSuccess: () => void;
}

export const LinkDirectoryUserModal: React.FC<LinkDirectoryUserModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}) => {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<DirRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQ('');
      setRows([]);
      setSelectedId(null);
      setLoading(false);
      setSaving(false);
    }
  }, [isOpen]);

  const search = async () => {
    const term = q.trim();
    if (!term) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const pattern = `%${term.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
      const sel = 'id,name,email,phone,user_id';
      const [nRes, eRes, pRes] = await Promise.all([
        supabase.from('team_members').select(sel).ilike('name', pattern).order('name', { ascending: true }).limit(25),
        supabase.from('team_members').select(sel).ilike('email', pattern).order('name', { ascending: true }).limit(25),
        supabase.from('team_members').select(sel).ilike('phone', pattern).order('name', { ascending: true }).limit(25),
      ]);
      if (nRes.error) throw nRes.error;
      if (eRes.error) throw eRes.error;
      if (pRes.error) throw pRes.error;
      const merged = new Map<string, DirRow>();
      for (const r of [...(nRes.data || []), ...(eRes.data || []), ...(pRes.data || [])] as DirRow[]) {
        merged.set(r.id, r);
      }
      setRows([...merged.values()].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedId(null);
    } catch (e) {
      console.error('Directory search failed', e);
      alert('Could not search directory. Check Supabase connection and RLS.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const linkSelected = async () => {
    if (!targetUser || !selectedId) return;
    const row = rows.find((r) => r.id === selectedId);
    if (!row) return;
    if (row.user_id && row.user_id !== targetUser.id) {
      if (
        !window.confirm(
          'This directory person is already linked to another website user. Replace the link with this user?'
        )
      ) {
        return;
      }
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ user_id: targetUser.id, created_from_user_sync: false })
        .eq('id', selectedId);
      if (error) throw error;
      alert('Directory link saved.');
      onSuccess();
      onClose();
    } catch (e: unknown) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Failed to link');
    } finally {
      setSaving(false);
    }
  };

  const unlink = async () => {
    if (!targetUser?.id) return;
    if (!window.confirm('Remove the Directory link for this user? They will lose roster access until linked again.')) {
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('team_members').update({ user_id: null }).eq('user_id', targetUser.id);
      if (error) throw error;
      alert('Link removed.');
      onSuccess();
      onClose();
    } catch (e: unknown) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Failed to unlink');
    } finally {
      setSaving(false);
    }
  };

  if (!targetUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Link to Directory — ${displayName(targetUser)}`}>
      <div className="space-y-4">
        <p className="text-sm text-neutral">
          Search for an existing directory person (unlinked or linked). Linking sets <code className="text-xs">user_id</code>{' '}
          so ministry groups and rosters apply to this login.
        </p>

        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, email, or phone…"
            className="flex-1 min-w-[200px] p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void search()}
            disabled={loading || !q.trim()}
            className="px-4 py-3 bg-white border border-gray-200 rounded-[4px] font-bold text-charcoal hover:border-gold inline-flex items-center gap-2"
          >
            <Search size={16} />
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-[6px] divide-y divide-gray-100">
          {rows.length === 0 ? (
            <p className="p-4 text-sm text-neutral">No results yet. Search above.</p>
          ) : (
            rows.map((r) => (
              <label
                key={r.id}
                className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gold/5 ${
                  selectedId === r.id ? 'bg-gold/10' : ''
                }`}
              >
                <input
                  type="radio"
                  name="dir-pick"
                  checked={selectedId === r.id}
                  onChange={() => setSelectedId(r.id)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-charcoal truncate">{r.name}</p>
                  <p className="text-xs text-neutral truncate">{r.email || '—'} · {r.phone || '—'}</p>
                  {r.user_id && r.user_id !== targetUser.id && (
                    <p className="text-xs text-amber-800 mt-1">Linked to another user — replacing will move the link.</p>
                  )}
                  {r.user_id === targetUser.id && (
                    <p className="text-xs text-green-700 mt-1">Already linked to this user.</p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-end pt-2">
          <button
            type="button"
            onClick={() => void unlink()}
            disabled={saving}
            className="px-4 py-2 border border-red-200 text-red-700 rounded-[4px] font-bold hover:bg-red-50 inline-flex items-center justify-center gap-2"
          >
            <Unlink size={16} />
            Unlink directory
          </button>
          <GlowingButton type="button" onClick={() => void linkSelected()} disabled={saving || !selectedId}>
            <Link2 size={16} className="inline mr-1" />
            Link selected
          </GlowingButton>
        </div>
      </div>
    </Modal>
  );
};
