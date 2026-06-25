import React, { useState, useEffect } from 'react';
import { GlowingButton } from '../../components/UI/GlowingButton';
import { Modal } from '../../components/UI/Modal';
import { Calendar as CalIcon, Edit, Trash2, Plus, Users, Image, Upload } from 'lucide-react';
import type { Event, EventCategory } from '../../types';
import { supabase } from '../../lib/supabase';
import { SkeletonPageHeader } from '../../components/UI/Skeleton';
import { EventsCalendarGrid, EventsCalendarGridSkeleton } from '../../components/dashboard/EventsCalendarGrid';
import { EventImage } from '../../components/UI/EventImage';
import { EVENT_IMAGE } from '../../lib/eventImageSpec';
import { downloadEventRsvpsCsv, downloadEventRsvpsPdf } from '../../lib/exportEventRsvps';
import {
  buildEventDateTimePayload,
  parseTimeToInputValue,
} from '../../lib/eventDateUtils';
import { logAuditEvent } from '../../lib/auditLog';
import metadata from '../../metadata.json';

const DEFAULT_THUMB = '/ABC Logo.png';
const FALLBACK_CATEGORIES = [
  'Sunday Service',
  'Members Meeting',
  'Fast & Prayer Meeting',
  'Young Adults',
  'Teens & Youth',
  'Kids Programme',
  'Other',
] as const;

const sortCategoriesAlphabetically = (categories: string[]) =>
  [...categories].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

export const AdminEvents = () => {
  const churchName = (metadata as any)?.name ? String((metadata as any).name) : 'Church';
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(sortCategoriesAlphabetically([...FALLBACK_CATEGORIES]));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [rsvpEvent, setRsvpEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<Array<{ id: string; name: string; email: string; created_at: string }>>([]);
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(false);
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [formData, setFormData] = useState({ 
    title: '', 
    start_date: '', 
    end_date: '', 
    start_time: '', 
    end_time: '', 
    location: '', 
    category: '',
    image_url: '',
    description: '',
    is_public: true,
    rsvp_mode: 'optional' as 'optional' | 'required',
    audience: 'members' as 'all' | 'staff' | 'members' | 'attendees',
  });

  useEffect(() => {
    fetchEvents();
    fetchEventCategories();
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

  const fetchEventCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select('name, is_active')
        .order('name', { ascending: true });

      if (error) throw error;

      const names =
        (data || [])
          .filter((c: Pick<EventCategory, 'is_active'>) => (c as any).is_active !== false)
          .map((c: Pick<EventCategory, 'name'>) => (c as any).name)
          .filter((n: any): n is string => typeof n === 'string' && n.trim().length > 0) || [];

      // Keep legacy behavior if table isn't seeded yet.
      setCategoryOptions(
        sortCategoriesAlphabetically(names.length > 0 ? names : [...FALLBACK_CATEGORIES])
      );
    } catch (e) {
      console.warn('AdminEvents - failed to load event_categories, using fallback list', e);
      setCategoryOptions(sortCategoriesAlphabetically([...FALLBACK_CATEGORIES]));
    }
  };

  const isScheduleValid = () => {
    if (
      !formData.start_date ||
      !formData.end_date ||
      !formData.start_time ||
      !formData.end_time
    ) {
      return false;
    }
    if (formData.end_date < formData.start_date) return false;
    if (
      formData.end_date === formData.start_date &&
      formData.end_time < formData.start_time
    ) {
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.location || !isScheduleValid()) {
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = await runUpload();
      const dateTimeFields = buildEventDateTimePayload(formData);
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            title: formData.title,
            ...dateTimeFields,
            location: formData.location,
            category: formData.category || 'Other',
            image_url: imageUrl || null,
            description: formData.description,
            is_public: formData.is_public,
            rsvp_mode: formData.rsvp_mode,
            audience: formData.is_public ? 'all' : formData.audience,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await logAuditEvent({
        action: 'create',
        category: 'events',
        entityType: 'events',
        entityId: data.id,
        summary: `Created event "${formData.title}"`,
        details: { title: formData.title, is_public: formData.is_public },
      });

      setEvents([...events, data]);
      resetModal();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(
        (error.message || 'Failed to create event') +
          '\n\nIf the database is missing new columns, run ADD_EVENT_IMAGE_URL.sql in Supabase.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      start_date: event.start_date || event.date,
      end_date: event.end_date || event.start_date || event.date,
      start_time: parseTimeToInputValue(event.start_time || event.time),
      end_time: parseTimeToInputValue(event.end_time || event.start_time || event.time),
      location: event.location,
      category: event.category,
      image_url: event.image_url || '',
      description: event.description || '',
      is_public: event.is_public,
      rsvp_mode: (event.rsvp_mode || 'optional') as 'optional' | 'required',
      audience: ((event.audience || (event.is_public ? 'all' : 'members')) as any),
    });
    setSelectedFile(null);
    setPreviewUrl(event.image_url || null);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;

    try {
      setIsUploading(true);
      const imageUrl = await runUpload();
      const dateTimeFields = buildEventDateTimePayload(formData);
      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          ...dateTimeFields,
          location: formData.location,
          category: formData.category || 'Other',
          image_url: imageUrl || null,
          description: formData.description,
          is_public: formData.is_public,
          rsvp_mode: formData.rsvp_mode,
          audience: formData.is_public ? 'all' : formData.audience,
        })
        .eq('id', editingEvent.id);

      if (error) throw error;

      await logAuditEvent({
        action: 'update',
        category: 'events',
        entityType: 'events',
        entityId: editingEvent.id,
        summary: `Updated event "${formData.title}"`,
        details: { title: formData.title },
      });

      fetchEvents();
      resetModal();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error updating event:', error);
      alert(
        (error.message || 'Failed to update event') +
          '\n\nIf the database is missing new columns, run ADD_EVENT_IMAGE_URL.sql in Supabase.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const evt = events.find((e) => e.id === id);
      const { error } = await supabase.from('events').delete().eq('id', id);

      if (error) throw error;

      await logAuditEvent({
        action: 'delete',
        category: 'events',
        entityType: 'events',
        entityId: id,
        summary: `Deleted event "${evt?.title || id}"`,
      });

      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    resetModal();
    setIsModalOpen(true);
  };

  const resetModal = () => {
    setFormData({
      title: '',
      start_date: '',
      end_date: '',
      start_time: '',
      end_time: '',
      location: '',
      category: '',
      image_url: '',
      description: '',
      is_public: true,
      rsvp_mode: 'optional',
      audience: 'members',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const openRsvpModal = async (evt: Event) => {
    setRsvpEvent(evt);
    setIsRsvpModalOpen(true);
    setIsLoadingRsvps(true);
    setRsvps([]);
    setRsvpSearch('');

    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('id,name,email,created_at')
        .eq('event_id', evt.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRsvps((data as any[]) || []);
    } catch (e: unknown) {
      console.error('Error fetching RSVPs:', e);
      alert(
        (e instanceof Error ? e.message : 'Failed to load RSVPs') +
          '\n\nIf the database table is missing, run CREATE_EVENT_RSVPS_TABLE.sql in Supabase.'
      );
    } finally {
      setIsLoadingRsvps(false);
    }
  };

  const filteredRsvps = (() => {
    const q = rsvpSearch.trim().toLowerCase();
    if (!q) return rsvps;
    return rsvps.filter((r) => {
      const name = String(r.name ?? '').toLowerCase();
      const email = String(r.email ?? '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  })();

  const rsvpFilenameBase = (evt: Event) => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const safeTitle = (evt.title || 'event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `event-rsvps-${safeTitle}-${yyyy}-${mm}-${dd}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG/JPG)');
        return;
      }
      if (file.size > EVENT_IMAGE.maxFileBytes) {
        alert('Image size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runUpload = async (): Promise<string> => {
    if (!selectedFile) return formData.image_url || '';

    let imageUrl = formData.image_url || '';
    try {
      const fileExt = selectedFile.name.split('.').pop() || 'jpg';
      const fileName = `event-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('events').upload(fileName, selectedFile, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        console.warn('Storage upload failed, saving as base64:', uploadError.message);
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            if (reader.result) resolve(reader.result as string);
            else reject(new Error('Failed to convert file to base64'));
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(selectedFile);
        imageUrl = await base64Promise;
      } else {
        const { data: urlData } = supabase.storage.from('events').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    } catch (e: unknown) {
      console.warn('Storage upload failed, using base64 fallback:', e);
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (reader.result) resolve(reader.result as string);
          else reject(new Error('Failed to convert file to base64'));
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(selectedFile);
      imageUrl = await base64Promise;
    }

    setFormData((prev) => ({ ...prev, image_url: imageUrl }));
    return imageUrl;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonPageHeader />
        <EventsCalendarGridSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-serif font-normal text-charcoal">Events Management</h1>
          <p className="text-neutral mt-1">Create and manage church events and meetings.</p>
        </div>
        <GlowingButton size="sm" fullWidth className="sm:w-auto" onClick={openCreateModal}>
          <Plus size={16} className="mr-2" />
          Add Event
        </GlowingButton>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalIcon className="text-gray-300" size={28} />
          </div>
          <p className="text-neutral font-bold">No events yet.</p>
          <p className="text-neutral text-sm mt-1">Create your first event to get started.</p>
        </div>
      ) : (
        <EventsCalendarGrid
          events={events}
          showVisibilityBadges
          adminControlsForEvent={(evt) => (
            <>
              <button
                type="button"
                onClick={() => openRsvpModal(evt)}
                className="p-2.5 bg-white border border-gray-200 rounded-full text-neutral hover:text-gold hover:border-gold shadow-sm transition-colors"
                title="View RSVPs"
              >
                <Users size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleEdit(evt)}
                className="p-2.5 bg-white border border-gray-200 rounded-full text-neutral hover:text-gold hover:border-gold shadow-sm transition-colors"
                title="Edit"
              >
                <Edit size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(evt.id)}
                className="p-2.5 bg-white border border-gray-200 rounded-full text-neutral hover:text-red-500 hover:border-red-200 shadow-sm transition-colors"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
          resetModal();
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
              <label className="block text-sm font-bold text-charcoal mb-2">Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => {
                  const startDate = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    start_date: startDate,
                    end_date:
                      !prev.end_date || prev.end_date < startDate ? startDate : prev.end_date,
                  }));
                }}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">End Date *</label>
              <input
                type="date"
                value={formData.end_date}
                min={formData.start_date || undefined}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Start Time *</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">End Time *</label>
              <input
                type="time"
                value={formData.end_time}
                min={formData.start_date === formData.end_date ? formData.start_time || undefined : undefined}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none"
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
              {categoryOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">
              Event Banner Image
            </label>
            <div className="mb-3 rounded-[8px] bg-gold/10 border border-gold/25 px-3 py-2.5">
              <p className="text-sm font-bold text-charcoal">Use any photo — landscape works best</p>
              <p className="text-xs text-neutral mt-1">{EVENT_IMAGE.uploadHint}</p>
            </div>
            <div className="rounded-[10px] border-2 border-dashed border-gray-200 hover:border-gold/50 transition-colors p-4">
              <div className="flex items-start gap-4">
                <div className="w-40 aspect-[16/9] rounded-[8px] overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0" style={{ aspectRatio: '16 / 9' }}>
                  {(previewUrl || formData.image_url) ? (
                    <EventImage
                      src={previewUrl || formData.image_url || DEFAULT_THUMB}
                      alt="Event preview"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#3a4a1f] via-[#4a5d2a] to-[#2d3a16] flex items-center justify-center">
                      <img src={DEFAULT_THUMB} alt="Default" className="h-6 w-auto opacity-80" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] bg-gold/10 text-charcoal text-sm font-bold hover:bg-gold/20 transition-colors cursor-pointer">
                    <Upload size={14} />
                    {selectedFile ? 'Change Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="sr-only"
                    />
                  </label>
                  {selectedFile && (
                    <p className="text-xs text-gold font-bold mt-1.5">{selectedFile.name}</p>
                  )}
                  {!selectedFile && !formData.image_url && (
                    <p className="text-xs text-neutral mt-1.5">Defaults to church logo if left empty.</p>
                  )}
                </div>
              </div>
            </div>
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

          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Audience</label>
            <select
              value={formData.is_public ? 'all' : formData.audience}
              onChange={(e) =>
                setFormData({ ...formData, audience: e.target.value as 'all' | 'staff' | 'members' | 'attendees' })
              }
              disabled={formData.is_public}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none bg-white disabled:opacity-60"
            >
              <option value="all">All</option>
              <option value="members">Members (logged in)</option>
              <option value="staff">Staff (admins only)</option>
              <option value="attendees">Attendees (public visitors)</option>
            </select>
            <p className="text-xs text-neutral mt-1">
              Public events are always visible to all. For private events: Staff = admins only, Members = any logged-in user.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">RSVP</label>
            <select
              value={formData.rsvp_mode}
              onChange={(e) => setFormData({ ...formData, rsvp_mode: e.target.value as 'optional' | 'required' })}
              className="w-full p-3 rounded-[4px] border border-gray-200 focus:border-gold focus:outline-none bg-white"
            >
              <option value="optional">Optional</option>
              <option value="required">Required</option>
            </select>
            <p className="text-xs text-neutral mt-1">Shown on the event detail page as “RSVP optional/required”.</p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingEvent(null);
                resetModal();
              }}
              className="px-6 py-2 border border-gray-200 rounded-[4px] text-charcoal hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <GlowingButton
              onClick={editingEvent ? handleUpdate : handleCreate}
              disabled={!formData.title || !formData.location || !isScheduleValid() || isUploading}
            >
              {isUploading ? 'Uploading...' : editingEvent ? 'Update Event' : 'Add Event'}
            </GlowingButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRsvpModalOpen}
        onClose={() => {
          setIsRsvpModalOpen(false);
          setRsvpEvent(null);
          setRsvps([]);
          setIsLoadingRsvps(false);
          setRsvpSearch('');
        }}
        title={rsvpEvent ? `RSVPs — ${rsvpEvent.title}` : 'RSVPs'}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-neutral">
              Showing{' '}
              <span className="font-bold text-charcoal">{filteredRsvps.length}</span> of{' '}
              <span className="font-bold text-charcoal">{rsvps.length}</span>
            </p>
            {rsvpEvent ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadEventRsvpsCsv(filteredRsvps, rsvpFilenameBase(rsvpEvent), `RSVPs — ${rsvpEvent.title}`, {
                      churchName,
                      exportedAt: new Date(),
                    })
                  }
                  className="bg-white border border-gray-200 text-charcoal px-3 py-2 rounded-[6px] font-bold hover:bg-gray-50 transition-colors text-sm"
                  title="Download CSV"
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadEventRsvpsPdf(
                      filteredRsvps,
                      rsvpFilenameBase(rsvpEvent),
                      `RSVPs — ${rsvpEvent.title}`,
                      { churchName, exportedAt: new Date() }
                    )
                  }
                  className="bg-white border border-gray-200 text-charcoal px-3 py-2 rounded-[6px] font-bold hover:bg-gray-50 transition-colors text-sm"
                  title="Download PDF"
                >
                  PDF
                </button>
              </div>
            ) : (
              <span className="text-xs text-neutral">—</span>
            )}
          </div>

          <div>
            <input
              type="text"
              value={rsvpSearch}
              onChange={(e) => setRsvpSearch(e.target.value)}
              className="w-full p-3 rounded-[8px] border border-gray-200 focus:border-gold focus:outline-none"
              placeholder="Search by name or email…"
            />
          </div>

          {isLoadingRsvps ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredRsvps.length === 0 ? (
            <p className="text-neutral text-sm">No RSVPs yet.</p>
          ) : (
            <div className="max-h-80 overflow-x-auto overflow-y-auto border border-gray-100 rounded-[8px]">
              <table className="w-full text-left">
                <thead className="bg-white sticky top-0">
                  <tr className="border-b border-gray-100">
                    <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral">Name</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral">Email</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRsvps.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50">
                      <td className="px-3 py-2 text-sm text-charcoal font-bold">{r.name}</td>
                      <td className="px-3 py-2 text-sm text-neutral">{r.email}</td>
                      <td className="px-3 py-2 text-sm text-neutral">
                        {new Date(r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

