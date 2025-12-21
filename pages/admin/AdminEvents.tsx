import React, { useState } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { Calendar as CalIcon, Edit, Trash2, Plus } from 'lucide-react';
import { Event } from '../../types';

export const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([
    { id: '1', title: "Worship Team Rehearsal", date: "Oct 24", time: "7:30 PM", location: "Main Auditorium", category: "Rehearsal" },
    { id: '2', title: "Elders Meeting", date: "Oct 26", time: "6:00 PM", location: "Meeting Room B", category: "Meeting" },
    { id: '3', title: "Working Bee", date: "Oct 29", time: "8:00 AM", location: "Grounds", category: "Service" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({ title: '', date: '', time: '', location: '', category: '' });

  const handleCreate = () => {
    const newEvent: Event = {
      id: Date.now().toString(),
      ...formData,
    };
    setEvents([...events, newEvent]);
    setFormData({ title: '', date: '', time: '', location: '', category: '' });
    setIsModalOpen(false);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    if (!editingEvent) return;
    setEvents(events.map(e =>
      e.id === editingEvent.id
        ? { ...e, ...formData }
        : e
    ));
    setFormData({ title: '', date: '', time: '', location: '', category: '' });
    setEditingEvent(null);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({ title: '', date: '', time: '', location: '', category: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal">Events Management</h1>
          <p className="text-neutral mt-1">Create and manage church events and meetings.</p>
        </div>
        <GlowingButton size="sm" onClick={openCreateModal}>
          <Plus size={16} className="mr-2" />
          Add Event
        </GlowingButton>
      </div>

      <div className="space-y-4">
        {events.map((evt) => (
          <div key={evt.id} className="flex items-center p-6 bg-white border border-gray-100 shadow-sm rounded-[8px] hover:border-gold hover:shadow-md transition-all group relative">
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
            <div className="flex-shrink-0 w-20 text-center border-r border-gray-100 pr-6 mr-6">
              <span className="block text-xs text-gold uppercase font-bold tracking-widest">{evt.date.split(' ')[0]}</span>
              <span className="block text-3xl font-serif text-charcoal font-bold">{evt.date.split(' ')[1]}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-charcoal group-hover:text-gold transition-colors">{evt.title}</h3>
              <p className="text-neutral text-sm mt-1 flex items-center">
                <span className="w-2 h-2 rounded-full bg-gold mr-2"></span>
                {evt.time} • {evt.location}
              </p>
              {evt.category && (
                <span className="inline-block mt-2 text-xs bg-gold/10 text-gold px-2 py-1 rounded uppercase tracking-wider font-bold">
                  {evt.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

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
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
                placeholder="e.g., Oct 24"
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
          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingEvent(null);
                setFormData({ title: '', date: '', time: '', location: '', category: '' });
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

