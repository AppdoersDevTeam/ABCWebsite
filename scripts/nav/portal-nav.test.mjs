import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ADMIN_NAV_DIVIDER_BEFORE,
  ADMIN_NAV_ORDER,
  MEMBER_NAV_DIVIDER_BEFORE,
  MEMBER_NAV_ORDER,
  comparePortalNavLabels,
  orderPortalNavItems,
  portalNavNeedsDivider,
} from '../../lib/dashboardNav.ts';

test('admin left menu follows UX order including Changelog and Users & Roles children', () => {
  const sorted = orderPortalNavItems(
    [
      { label: 'Overview' },
      { label: 'Annual Calendar' },
      {
        label: 'Users & Roles',
        children: [
          { label: 'Users' },
          { label: 'Roles & Permissions' },
        ],
      },
      { label: 'Prayers' },
      { label: 'Newsletters' },
      { label: 'Devotionals' },
      { label: "People's Directory" },
      { label: 'Events' },
      { label: 'Rosters (Beta)' },
      { label: 'System Setup' },
      { label: 'Help' },
      { label: 'Logs' },
      { label: 'Changelog' },
    ],
    ADMIN_NAV_ORDER,
  );

  assert.deepEqual(
    sorted.map((item) => item.label),
    [
      'Overview',
      'Events',
      'Annual Calendar',
      'Prayers',
      'Newsletters',
      'Devotionals',
      'Rosters (Beta)',
      "People's Directory",
      'Users & Roles',
      'System Setup',
      'Logs',
      'Changelog',
      'Help',
    ],
  );

  const usersRoles = sorted.find((item) => item.label === 'Users & Roles');
  assert.deepEqual(
    usersRoles?.children?.map((child) => child.label),
    ['Users', 'Roles & Permissions'],
  );
});

test('member left menu follows UX order', () => {
  const sorted = orderPortalNavItems(
    [
      { label: 'Overview' },
      { label: 'Annual Calendar' },
      { label: 'Prayers' },
      { label: 'Newsletters' },
      { label: 'Devotionals' },
      { label: 'Sermons' },
      { label: "People's Directory" },
      { label: 'Events' },
      { label: 'Rosters (Beta)' },
      { label: 'Help' },
    ],
    MEMBER_NAV_ORDER,
  );

  assert.deepEqual(
    sorted.map((item) => item.label),
    [
      'Overview',
      'Events',
      'Annual Calendar',
      'Prayers',
      'Newsletters',
      'Devotionals',
      'Sermons',
      'Rosters (Beta)',
      "People's Directory",
      'Help',
    ],
  );
});

test('nav labels compare case-insensitively', () => {
  assert.ok(comparePortalNavLabels('events', 'Help') < 0);
  assert.equal(comparePortalNavLabels('People', 'people'), 0);
});

test('member dividers appear at section boundaries', () => {
  const items = MEMBER_NAV_ORDER.map((label) => ({ label }));
  assert.equal(portalNavNeedsDivider(0, items, MEMBER_NAV_DIVIDER_BEFORE), false);
  assert.equal(portalNavNeedsDivider(1, items, MEMBER_NAV_DIVIDER_BEFORE), true); // Events
  assert.equal(portalNavNeedsDivider(2, items, MEMBER_NAV_DIVIDER_BEFORE), false); // Annual Calendar
  assert.equal(portalNavNeedsDivider(4, items, MEMBER_NAV_DIVIDER_BEFORE), true); // Newsletters
  assert.equal(portalNavNeedsDivider(7, items, MEMBER_NAV_DIVIDER_BEFORE), true); // Rosters
  assert.equal(portalNavNeedsDivider(9, items, MEMBER_NAV_DIVIDER_BEFORE), true); // Help
});

test('admin dividers appear at section boundaries', () => {
  const items = ADMIN_NAV_ORDER.map((label) => ({ label }));
  assert.equal(portalNavNeedsDivider(1, items, ADMIN_NAV_DIVIDER_BEFORE), true); // Events
  assert.equal(portalNavNeedsDivider(4, items, ADMIN_NAV_DIVIDER_BEFORE), true); // Newsletters
  assert.equal(portalNavNeedsDivider(6, items, ADMIN_NAV_DIVIDER_BEFORE), true); // Rosters
  assert.equal(portalNavNeedsDivider(8, items, ADMIN_NAV_DIVIDER_BEFORE), true); // Users & Roles
  assert.equal(portalNavNeedsDivider(9, items, ADMIN_NAV_DIVIDER_BEFORE), true); // System Setup
  assert.equal(portalNavNeedsDivider(12, items, ADMIN_NAV_DIVIDER_BEFORE), true); // Help
});
