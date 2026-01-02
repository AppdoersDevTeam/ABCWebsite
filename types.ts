import React from 'react';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  is_approved: boolean;
  role: 'member' | 'admin';
  created_at?: string;
  user_timezone?: string;
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
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RosterImage {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  pdf_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  description?: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PrayerRequest {
  id: string;
  user_id?: string;
  name: string;
  content: string;
  is_anonymous: boolean;
  is_confidential: boolean;
  prayer_count: number;
  created_at: string;
  updated_at?: string;
  user_timezone?: string;
}

export interface PrayerCount {
  id: string;
  prayer_request_id: string;
  user_id: string;
  created_at: string;
}

export interface Newsletter {
  id: string;
  title: string;
  month: string;
  year: number;
  pdf_url: string;
  created_at: string;
  updated_at?: string;
}

export interface Photo {
  id: string;
  folder_id?: string;
  url: string;
  title?: string;
  description?: string;
  created_at: string;
}

export interface PhotoFolder {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  img: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      prayer_requests: {
        Row: PrayerRequest;
        Insert: Omit<PrayerRequest, 'id' | 'prayer_count' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PrayerRequest, 'id' | 'created_at'>>;
      };
      prayer_counts: {
        Row: PrayerCount;
        Insert: Omit<PrayerCount, 'id' | 'created_at'>;
        Update: Partial<Omit<PrayerCount, 'id' | 'created_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at'>>;
      };
      newsletters: {
        Row: Newsletter;
        Insert: Omit<Newsletter, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Newsletter, 'id' | 'created_at'>>;
      };
      roster: {
        Row: RosterMember;
        Insert: Omit<RosterMember, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RosterMember, 'id' | 'created_at'>>;
      };
      roster_images: {
        Row: RosterImage;
        Insert: Omit<RosterImage, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RosterImage, 'id' | 'created_at'>>;
      };
      photos: {
        Row: Photo;
        Insert: Omit<Photo, 'id' | 'created_at'>;
        Update: Partial<Omit<Photo, 'id' | 'created_at'>>;
      };
      photo_folders: {
        Row: PhotoFolder;
        Insert: Omit<PhotoFolder, 'id' | 'created_at'>;
        Update: Partial<Omit<PhotoFolder, 'id' | 'created_at'>>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TeamMember, 'id' | 'created_at'>>;
      };
    };
  };
}