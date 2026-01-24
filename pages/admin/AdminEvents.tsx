import React, { useState, useEffect } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { Calendar as CalIcon, Edit, Trash2, Plus } from 'lucide-react';
import { Event } from '../../types';
import { supabase } from '../../lib/supabase';
import { SkeletonPageHeader, SkeletonEventCard } from '../../components/UI/Skeleton';
import { AdminPageHeader } from '../../components/UI/AdminPageHeader';

export const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    date: '', 
    time: '', 
    location: '', 
    category: '',
    description: '',
    is_public: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            title: formData.title,
            date: formData.date,
            time: formData.time,
            location: formData.location,
            category: formData.category || 'Other',
            description: formData.description,
            is_public: formData.is_public,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setEvents([...events, data]);
      setFormData({ title: '', date: '', time: '', location: '', category: '', description: '', is_public: true });
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(error.message || 'Failed to create event');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      description: event.description || '',
      is_public: event.is_public,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          category: formData.category || 'Other',
          description: formData.description,
          is_public: formData.is_public,
        })
        .eq('id', editingEvent.id);

      if (error) throw error;

      fetchEvents();
      setFormData({ title: '', date: '', time: '', location: '', category: '', description: '', is_public: true });
      setEditingEvent(null);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error updating event:', error);
      alert(error.message || 'Failed to update event');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const { error } = await supabase.from('events').delete().eq('id', id);

      if (error) throw error;

      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({ title: '', date: '', time: '', location: '', category: '', description: '', is_public: true });
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonEventCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Events Management"
        subtitle="Create and manage church events and meetings."
        icon={<CalIcon size={28} />}
        rightSlot={
          <GlowingButton size="sm" fullWidth className="md:w-auto" onClick={openCreateModal}>
            <Plus size={16} className="mr-2" />
            Add Event
          </GlowingButton>
        }
      />

      {events.length === 0 ? (
        <div className="text-center py-12 glass-card bg-white/80 border border-white/60 rounded-[12px]">
          <p className="text-neutral">No events yet. Create your first event!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((evt) => {
            const formattedDate = formatDate(evt.date);
            const dateParts = formattedDate.split(' ');
            return (
          <div key={evt.id} className="flex flex-col sm:flex-row sm:items-center p-6 glass-card bg-white/80 border border-white/60 shadow-sm rounded-[12px] hover:border-gold hover:shadow-md transition-all group relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(evt)}
                className="p-2 bg-white border border-gray-200 rounded-[4px] text-neutral hover:text-gold hover:border-gold transition-colors"
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(evt.id)}
                className="p-2 bg-white border border-gray-200 rounded-[4px] text-neutral hover:text-red-500 hover:border-red-200 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex-shrink-0 w-full sm:w-20 text-left sm:text-center border-b sm:border-b-0 sm:border-r border-gray-100 pb-4 sm:pb-0 sm:pr-6 sm:mr-6 mb-4 sm:mb-0">
              <span className="block text-xs text-gold uppercase font-bold tracking-widest">{dateParts[0]}</span>
              <span className="block text-3xl font-serif text-charcoal font-normal">{dateParts[1]}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-charcoal group-hover:text-gold transition-colors">{evt.title}</h3>
              <p className="text-neutral text-sm mt-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-gold mr-2"></span>
                {evt.time} • {evt.location}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {evt.category && (
                  <span className="inline-block text-xs bg-gold/10 text-gold px-2 py-1 rounded uppercase tracking-wider font-bold">
                    {evt.category}
                  </span>
                )}
                {evt.is_public ? (
                  <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded uppercase tracking-wider font-bold">
                    Public
                  </span>
                ) : (
                  <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded uppercase tracking-wider font-bold">
                    Private
                  </span>
                )}
              </div>
            </div>
          </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
          setFormData({ title: '', date: '', time: '', location: '', category: '' });
        }}
        title={editingEvent ? 'Edit Event' : 'Add Event'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Event Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="e.g., Worship Team Rehearsal"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Time *</label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
                placeholder="e.g., 7:30 PM"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="e.g., Main Auditorium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
            >
              <option value="">Select Category</option>
              <option value="Meeting">Meeting</option>
              <option value="Rehearsal">Rehearsal</option>
              <option value="Service">Service</option>
              <option value="Event">Event</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="Event description..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_public" className="text-sm text-charcoal">Make this event public</label>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingEvent(null);
                setFormData({ title: '', date: '', time: '', location: '', category: '', description: '', is_public: true });
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={editingEvent ? handleUpdate : handleCreate}
              disabled={!formData.title || !formData.date || !formData.time || !formData.location}
            >
              {editingEvent ? 'Update Event' : 'Add Event'}
            </GlowingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

