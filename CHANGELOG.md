# Changelog

Human-readable development history for **Ashburton Baptist Church**.

The machine-readable source of truth is `CHANGELOG.json`. Newest entries appear first.
Never delete historical entries. Never rewrite historical entries unless explicitly correcting them.

Timezone for new entries: **Pacific/Auckland**. Authoritative version: `package.json`.

## CHG-2026-2109-003 — Overview stays first with a gray menu divider

**Date:** 2026-09-21
**Time:** 00:25:00
**Timezone:** Pacific/Auckland
**Version:** 1.7.18
**Type:** Changed

**Request**

> keep only the Overview as the first menu on left and righ after that separate the rest of the menus with a gray line.

**Changes**

* Overview is pinned at the top of the Admin and Member left menus.
* A gray line separates Overview from the remaining pages, which stay in A–Z order.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 64 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP in this session; Overview-first order and divider placement are covered by portal-nav unit tests.

## CHG-2026-2109-002 — Admin and Member left menus are alphabetical

**Date:** 2026-09-21
**Time:** 00:20:06
**Timezone:** Pacific/Auckland
**Version:** 1.7.17
**Type:** Changed

**Request**

> Organize by alphabethic order the left menu for Admin and Members push wehn completed.

**Changes**

* The Admin and Member portal left menus now list pages A–Z by name.
* Under Users & Roles, Roles & Permissions now appears before Users.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 63 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP in this session; menu order is covered by portal-nav unit tests.

## CHG-2026-2109-001 — People add, archive, and delete send confirmation emails

**Date:** 2026-09-21
**Time:** 00:05:47
**Timezone:** Pacific/Auckland
**Version:** 1.7.16
**Type:** Added

**Request**

> When People has been added, archived ort delete, send an e-mail inofmring the person about that Action. Make a professional Email. when completed push.

**Changes**

* Adding, archiving, or deleting a person in People now emails them a branded confirmation of that action.
* Archive and delete wait for the email to send before changing the record. Add still saves the person if the email cannot be sent, and shows a warning.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 60 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. Live notify-directory-person v2 is deployed on the ABC Website Supabase project with index, recordEmailSend, emailQuota, and directoryPersonEmail. No live add/archive/delete was run in browser, to avoid emailing real people.

## CHG-2026-2009-028 — Users list shows Linked and red Pending

**Date:** 2026-09-20
**Time:** 23:57:48
**Timezone:** Pacific/Auckland
**Version:** 1.7.15
**Type:** Changed

**Request**

> On Users when a user has a linked account, show linked underneth the name as it is in People, same color also change the color of PENDING to red font color.  Push when completed.

**Changes**

* Users now shows Linked under the name in the same purple as People when the login is linked to a People record.
* Pending under the name is now red.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP in this session; Users name labels were checked in code.

## CHG-2026-2009-027 — People archive and delete warn about linked logins

**Date:** 2026-09-20
**Time:** 23:54:32
**Timezone:** Pacific/Auckland
**Version:** 1.7.14
**Type:** Changed

**Request**

> On People Menu, when the register is about to be archived or deleted check if the people is with a linked account if yes show a message about the account will be unlinked and asking if it is supposed to delete or archive also the linked account if yes do it for both showing the message that those accounts will be archive or delete. Push to Live.

**Changes**

* Archiving or deleting a person who has a linked website account now warns that the login will be unlinked, and asks whether to also archive (hold access) or delete that login.
* Choosing both shows that those accounts will be archived or deleted, then applies the People change and the matching Users action.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP in this session; archive and delete prompts were checked in code.

## CHG-2026-2009-026 — Overview approval avatars use the user photo

**Date:** 2026-09-20
**Time:** 23:46:49
**Timezone:** Pacific/Auckland
**Version:** 1.7.13
**Type:** Changed

**Request**

> On The Overview the User Approval Request Icon must match with the Icon of User Photo. when completed Push live.

**Changes**

* User Approval Requests on Admin Overview now use the same round user photo as Users (directory photo, or initials if there is no photo), with the same Users heading icon as the Users card.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP in this session; Overview approval avatars were checked in code.

## CHG-2026-2009-025 — Overview People card shows directory count

**Date:** 2026-09-20
**Time:** 23:21:21
**Timezone:** Pacific/Auckland
**Version:** 1.7.12
**Type:** Added

**Request**

> On the left Menu Overview, Add a card for People and Show the quantity of people in the system. Push when completed.

**Changes**

* Admin Overview now places a People card next to Users, showing how many active people are in the directory, with a description like the Users card.
* Member Overview now has a matching People card with the same directory count, linking to People.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP in this session; Overview cards were checked in code.

## CHG-2026-2009-024 — My Profile header uses the signed-in photo

**Date:** 2026-09-20
**Time:** 23:04:43
**Timezone:** Pacific/Auckland
**Version:** 1.7.11
**Type:** Changed

**Request**

> On User Profile tre User icon Profile must match tre user photo as per the left button top user Profile Icon.  push when completed.

**Changes**

* The My Profile page header icon now uses the same round user photo as the top-left My Profile menu (directory photo, then Google photo, then initials).

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP in this session; My Profile header now shares the same photo source as the top user menu.

## CHG-2026-2009-023 — Rename Leadership menu to People

**Date:** 2026-09-20
**Time:** 22:40:44
**Timezone:** Pacific/Auckland
**Version:** 1.7.10
**Type:** Changed

**Request**

> Change the leadership name on the left menu to People and update all system when changed push it to live.

**Changes**

* Admin and member left menus now say People instead of Leadership, including the People page titles, Overview card, Help, Logs, emails, System Setup copy, Users linking actions, and directory exports.
* The public website About Leadership section is unchanged.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP in this session; menus and labels were checked in code.

## CHG-2026-2009-022 — Leadership directory card matches Users

**Date:** 2026-09-20
**Time:** 22:26:43
**Timezone:** Pacific/Auckland
**Version:** 1.7.9
**Type:** Changed

**Request**

> Make the card for leadership like the card for Users same.

**Changes**

* Admin Leadership now uses the same table card as Users: gold Add Person button, underline Status/Group/Search filters, Export in the card, photo avatars, gold last-first names, ministry group, and a row action menu for Edit, Archive, and Delete.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP in this session; Leadership card was verified against the Users table markup.

## CHG-2026-2009-021 — Gold hover on Add User and Add Role

**Date:** 2026-09-20
**Time:** 22:09:43
**Timezone:** Pacific/Auckland
**Version:** 1.7.8
**Type:** Changed

**Request**

> On Users abd Role, there is a button Add Users and Add role when the hover user this collor background. push to live

**Changes**

* Add User (Users) and Add Role (Roles) now fill with the gold top-bar color on hover, with charcoal text so the label stays readable.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Unit tests, validate, and vite build run after implementation, then npm run push:live.

## CHG-2026-2009-020 — Larger, bolder arrows on user menu and left nav

**Date:** 2026-09-20
**Time:** 21:41:14
**Timezone:** Pacific/Auckland
**Version:** 1.7.7
**Type:** Changed

**Request**

> For all the left menus and top lef menu where there is a arrow, increase the arrows size in 3 ponts and make it bold. push when completed.

**Changes**

* The top-left user chevron is 3px larger (21px) and drawn with a heavier stroke.
* The Users & Roles left-menu chevron is 3px larger (19px) and drawn with a heavier stroke.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Unit tests, validate, and vite build run after implementation, then npm run push:live.

## CHG-2026-2009-019 — Round user photo on My Profile and tighter left menu

**Date:** 2026-09-20
**Time:** 21:39:46
**Timezone:** Pacific/Auckland
**Version:** 1.7.6
**Type:** Changed

**Request**

> For the My Profile icon use the User photo and make it a rounded photo Icon, for all the menus on the left decrease proportinally the hight size and the distance between all of them, push when completed.

**Changes**

* My Profile in the user-arrow menu uses the signed-in person's photo (directory or Google) as a round cropped icon.
* Left-menu items are shorter and closer together: smaller icons, less padding, and less gap between rows.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Unit tests, validate, and vite build run after implementation, then npm run push:live.

## CHG-2026-2009-018 — User-arrow menu visible above the left sidebar

**Date:** 2026-09-20
**Time:** 21:30:48
**Timezone:** Pacific/Auckland
**Version:** 1.7.5
**Type:** Fixed

**Request**

> I cannot see the Sign out and User Profiles inside the tole left buttom when click on the arrow. oush when completed.

**Changes**

* Clicking the top-left user arrow now opens My Profile, User Security, and Sign Out in a fixed overlay so the menu is no longer hidden under the left sidebar or the 64px top bar.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Unit tests, validate, and vite build run after implementation, then npm run push:live.

## CHG-2026-2009-017 — Sign Out in user menu; My Profile opens own user file

**Date:** 2026-09-20
**Time:** 21:26:09
**Timezone:** Pacific/Auckland
**Version:** 1.7.4
**Type:** Changed

**Request**

> The Sign Out left button on the bootom of the left menu, put it inside of the top user buttom arrow when open  the arrow also create a User Profile as per image, when clicked on the User Profile take the user to its on User File View.

**Changes**

* Sign Out is removed from the bottom of the left menu and is only in the top user-arrow menu, with the same logout behaviour.
* My Profile in that menu matches the attached sample (photo and gold label) and opens the signed-in person's own user file: name, contact, role, directory type, groups, job roles, baptism, and membership.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Unit tests, validate, and vite build run after implementation. Push to live was not requested.

## CHG-2026-2009-016 — Solid white notification bell on the gold search bar

**Date:** 2026-09-20
**Time:** 21:11:53
**Timezone:** Pacific/Auckland
**Version:** 1.7.3
**Type:** Changed

**Request**

> make the notification icon completed white on the search bar.

**Changes**

* The notification bell on the gold top bar is now a solid white icon instead of a thin outline.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Unit tests, validate, and vite build run after implementation. Push to live was not requested.

## CHG-2026-2009-015 — User menu Profile, Security, and Log Out; white bold top bar

**Date:** 2026-09-20
**Time:** 21:01:29
**Timezone:** Pacific/Auckland
**Version:** 1.7.2
**Type:** Changed

**Request**

> Make the Arrow up and down for the user like this option just add My Profile and Log Out options from the picture. Copy the Sign Out from the left bottom Menu to into it with the same funcionalities, Move the User Security Left Menu into this User menu as well with the same funcionalities. In the searh top bar change the 3 horizontal line on the left side bar and the description intead of Black to White collor e make it bold, increase the Itens on the right side bar into 5 pts.

**Changes**

* The user chevron shows down when closed and up when open. The menu is My Profile, User Security, and Log Out (same logout as the left-bottom Sign Out).
* User Security is removed from the left menu and opened from the user dropdown instead.
* The hamburger and page title on the gold bar are white and bold.
* Search, notifications, and Help on the right of the gold bar are 5px larger.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Unit tests, validate, and vite build run after implementation. Push to live was not requested.

## CHG-2026-2009-014 — White search field, notification bell, and thinner user-button border

**Date:** 2026-09-20
**Time:** 20:51:55
**Timezone:** Pacific/Auckland
**Version:** 1.7.1
**Type:** Changed

**Request**

> For the Search Bar, change the font to White like the one attached and the search button like the picture attached, remove it and add a Notification icon, For the User button on the left top remove the black line and make it a light gray thinner. Also decrease the round corner in 5pts. Push live when finished.

**Changes**

* Search is a transparent rounded field with a white magnifying-glass icon inside and white Search text, matching the attached gold bar.
* The separate search button on the right is removed and replaced with a notification bell (empty state: No new notifications).
* The top-left user button no longer has a dark/black outline: it uses a thinner light gray border, and the corner radius is 5px smaller (11px).

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Unit tests, validate, and vite build run after implementation, then npm run push:live.

## CHG-2026-2009-013 — Taller user menu, collapsible icon sidebar, and search button

**Date:** 2026-09-20
**Time:** 20:41:41
**Timezone:** Pacific/Auckland
**Version:** 1.7.0
**Type:** Changed

**Request**

> Increase the height of the Button User on top left, when click the arrow, show My profile and option to sign out. Make the button Background a bit more dark gray as well as the hover. The 3 horizontal lines in front of the search bar when clicked close all menu bar leaving only the icons visible and when click again open all the left menu again. yet in the seach bar the search button on the right side make it as a retangle with the round corners with 3 points. when conclude push it to live.

**Changes**

* The top-left identity button is taller (56px) with a darker gray background and darker hover, matching the attached user-menu sample.
* Clicking the chevron opens My Profile (gold, with the directory photo), the selected church with a check, Add Ministry, and Log Out.
* The hamburger beside Search collapses the left menu to icons only and expands it again.
* Search now has a rectangular submit button on the right with 3px rounded corners.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Unit tests, validate, and vite build run after implementation, then npm run push:live.

## CHG-2026-2009-012 — Separate identity card from yellow search bar and darken menu hover

**Date:** 2026-09-20
**Time:** 20:23:30
**Timezone:** Pacific/Auckland
**Version:** 1.6.1
**Type:** Changed

**Request**

> Separate the button and the search bar as per image, increase the height of the bar as well as the user button in 3pts and the hover of the left menu make it a bit more dark gray than what is at the moment, when finish pus it live.

**Changes**

* The church/user identity card now sits in its own white column beside the yellow top bar, with Search on the right of the yellow bar.
* The top bar is 3px taller (59px) and the identity button is 3px taller (47px).
* Left-menu hover is a darker gray (gray-200 instead of gray-50).

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Unit tests, validate, and vite build run after implementation, then npm run push:live.

## CHG-2026-2009-011 — Gray dashboard canvas, yellow top bar, and compact portal identity

**Date:** 2026-09-20
**Time:** 20:13:26
**Timezone:** Pacific/Auckland
**Version:** 1.6.0
**Type:** Changed

**Request**

> Use the admin and member dashboard Background color as per the square gray color attached, also use the yellow attached to make the top search bar for the dashboard background. For the Admin Portal on the top left make it as the Admin Portal file attached, copy the rectangle as well as fonts and background also add the user logged in there. decrease the height.

**Changes**

* Admin and member dashboards now use a flat light gray canvas instead of the photo background.
* A compact yellow top bar holds Search (jumps to matching left-menu pages), the current page name, and Help.
* The tall Admin/Member Portal logo block is replaced by a short white rounded identity card: church logo, church name, the signed-in person’s name, and a chevron menu (public site, switch role, sign out).

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Unit tests, validate, and vite build run after implementation. Typecheck still fails on pre-existing app errors. No browser MCP; verify Admin and Member dashboards after refresh.

## CHG-2026-2009-010 — Admin Users & Roles menu with Users and Roles cards

**Date:** 2026-09-20
**Time:** 19:49:11
**Timezone:** Pacific/Auckland
**Version:** 1.5.0
**Type:** Added

**Request**

> On the Left Side menu from Admin, Create a new Item called Users & Roles with an arrow to open up and down. Inside it add a new sub-menu called Users and another called Roles & Permissions. For Users create a card matching the attached Users image. For Roles create a card matching the attached Roles image, without a permissions editor.

**Changes**

* Replaced the Admin User Management left-menu item with an expandable Users & Roles section. Sub-items are Users and Roles & Permissions.
* Users is now a searchable table card: add user, role filter, name/username/email/mobile search, export, checkboxes, last-access date, ministry group, and a row menu (notify, roles, edit, delete, plus existing approval and leadership actions).
* Added a Roles card to add, edit, and delete named roles with a role type (Account, Member, or Group Leader) and a user count. There is no permissions matrix. Owner cannot be deleted.
* Added account_roles in the database, assigned existing logins to Owner/Admin/Member, and an admin last-access lookup from sign-in time.

**Database**

* supabase/migrations/20260920074500_account_roles.sql

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP in this session; Users and Roles screens were verified by production build and by reading the new menu, table, and role-card code.

## CHG-2026-2009-009 — Auto-run allowlisted Cursor agent commands without Run prompts

**Date:** 2026-09-20
**Time:** 19:14:06
**Timezone:** Pacific/Auckland
**Version:** 1.4.3
**Type:** Infrastructure

**Request**

> set ut cursor for not ask me anymore run or approve anymore command, i dont want to click RUN all the time, make sure that when it i whisllist it will go auto without ask me .

**Changes**

* The project auto-run rule now tells the agent never to ask in chat for Run or Allow, and to auto-run allowlisted git, npm, node, Hub, and push commands.
* Laptop Cursor permissions were set so allowlisted terminal commands (git, npm, node, Hub CLI, and similar) run without a Run click. Force-push and hard reset still ask first.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: 57 unit tests and npm run validate passed. No app UI change; browser verification not applicable. Laptop ~/.cursor/permissions.json and CLI approvalMode are local to this machine.

## CHG-2026-2009-008 — Show approved Users count on Admin Overview

**Date:** 2026-09-20
**Time:** 18:55:15
**Timezone:** Pacific/Auckland
**Version:** 1.4.2
**Type:** Changed

**Request**

> On Admin dashboard, Left menu Overview, there is a card called Pending Users, Change that card to Users only and show the number of Approved Users from the System. Update all system, Front End, Admin Dashboard and or Members Dashboard. Do a push to live when completed.

**Changes**

* The Admin Overview stat card is now labelled Users and shows the count of approved users in the system. Clicking it opens User Management.
* The pending-approvals list and Review Pending Users shortcut on Overview are unchanged so new signups can still be approved. The member dashboard had no matching Pending Users card, so it was left as-is. Admin Help Overview now describes the Users card.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP; verified Admin Overview stats card uses Users + approved count.

## CHG-2026-2009-007 — Add Events item to the public website menu

**Date:** 2026-09-20
**Time:** 16:48:28
**Timezone:** Pacific/Auckland
**Version:** 1.4.1
**Type:** Added

**Request**

> Add a new Menu call Events and once clicked on there take the person to the Events page.

**Changes**

* The public header and mobile menus now include Events as its own item. Clicking it opens the Events calendar page at /events.
* The Ministries menu is unchanged.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP; verified PublicLayout header and mobile nav include Events linking to /events.

## CHG-2026-2009-006 — Replace What's On with Ministries pages outside /events

**Date:** 2026-09-20
**Time:** 16:34:28
**Timezone:** Pacific/Auckland
**Version:** 1.4.0
**Type:** Changed

**Request**

> On Front end Webpage update What's On with new items: change the menu from What's On to Ministries, remove Young Adult, Kids Program and Teen & Youth from that menu, add Sunday Service first then alphabetical ministry pages at /<name> not under /events, and push to GitHub without asking to run or allow.

**Changes**

* The public header menu now says Ministries, with Sunday Service first, then Boys Brigade, CAP, Children, Connect Groups, Counselling, Couples, Family, Girls Brigade, Men, Missions, Pastoral Care, Plus 65+, Teens & Youth, Women, Worship, and Young Adults.
* Each ministry uses a top-level address such as /sunday-service, /children, and /cap instead of /events/kids-program. Old Events submenu links redirect to the new addresses.
* Sunday Service, Children, Teens & Youth, and Young Adults keep their existing page content. New ministries have public pages with church-office contact next steps. Visiting ashburtonbaptist.co.nz/children opens the matching page.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP; verified routes, menu config, and production bundle include Ministries pages.

## CHG-2026-2009-005 — Change public website menu from Events to What's On

**Date:** 2026-09-20
**Time:** 15:25:04
**Timezone:** Pacific/Auckland
**Version:** 1.3.5
**Type:** Changed

**Request**

> Change the Website frontend the menu Events to What's On. when completed push to github.

**Changes**

* The public website header menu and footer Explore link now say What's On instead of Events.
* Member and admin dashboard menus still say Events. Website addresses still use /events so existing links keep working.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate passed. vite build passed. Typecheck still fails on pre-existing app errors. No browser MCP was available; verified PublicLayout header and footer use What's On, and dashboards still use Events.

## CHG-2026-2009-004 — Rename What's On back to Events across the site

**Date:** 2026-09-20
**Time:** 15:16:14
**Timezone:** Pacific/Auckland
**Version:** 1.3.4
**Type:** Changed

**Request**

> On the Website Menu, change the What's ON to Events, update all dashboards, frontend and backend. When finished push it to live.

**Changes**

* The public menu, footer, member dashboard, and admin dashboard now say Events instead of What's On.
* Page titles, help text, calendar filters, logs, and the changelog area label match Events. Website addresses still use /events so existing links keep working.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 57 unit tests and npm run validate. vite build. Typecheck still fails on pre-existing app errors. Browser E2E tools were not available. Change ID remapped from CHG-2026-2009-002 because remote main already used 002 and 003 for Hub setup.

## CHG-2026-2009-003 — Require each teammate laptop to use its own Hub token

**Date:** 2026-09-20
**Time:** 14:38:19
**Timezone:** Pacific/Auckland
**Version:** 1.3.3
**Type:** Infrastructure

**Request**

> Ensure hub process is followed for other machines as well. eg someone else who has access to this repo locally and uses cursor to make changes

**Changes**

* Added HUB-SETUP.md and node tools/setup-hub-token.mjs so each person generates their own Hub token on their own laptop after cloning.
* File-edit hook now blocks writes when this laptop has no Hub token, even if a leftover ticket file exists, and tells the agent to stop and run laptop setup.
* New-chat sessionStart hook reminds the agent to run whoami and confirm session, or to stop if the token is missing.
* AGENTS.md, always-apply Hub rules, and verify-setup now say not to copy another person's token.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: 57 unit tests including Hub laptop-setup and hook tests. npm run validate passed. No app UI change; browser verification not applicable. Change ID remapped from CHG-2026-2009-002 because that ID now belongs to the Hub-mandatory commit after the remote What's On rename.

## CHG-2026-2009-002 — Make Appdoers Hub mandatory on every agent request in this repo

**Date:** 2026-09-20
**Time:** 14:31:20
**Timezone:** Pacific/Auckland
**Version:** 1.3.2
**Type:** Infrastructure

**Request**

> SET UP SO EVERYONE IN THIS REPO ALWAYS USES THE HUB: Appdoers Hub is the source of truth for all work. Follow this on every request, including the first message of a new chat. Do not skip it because a folder looks unrelated, because the user asked for a small change, or because rules already exist. CLI only, session confirm, tickets before edits, stages, and time tracking.

**Changes**

* Added an always-apply Cursor rule and a shared project skill so every agent chat must confirm Hub session, create or use a ticket before edits, use only node tools/hub-workflow-cli.mjs, follow stages, and flush time.
* AGENTS.md and Hub rules now include GitHub install and token-setup fallbacks if the CLI is missing, and say not to skip Hub for small changes or unrelated-looking folders.
* The require-hub-ticket Cursor hook now fails closed, so a broken hook cannot let file edits through without a ticket.
* Added tests that Hub always-apply rules, the project skill, and failClosed exist.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: 49 unit tests including new Hub always-apply rule tests. npm run validate passed. No app UI change; browser verification not applicable. Change ID remapped from CHG-2026-2009-001 because remote main already used that ID for the What's On rename.

## CHG-2026-2009-001 — Rename Events to What's On across the site

**Date:** 2026-09-20
**Time:** 14:18:39
**Timezone:** Pacific/Auckland
**Version:** 1.3.1
**Type:** Changed

**Request**

> On the front end website change the menu Events to What's ON and update all backend, dashboards and frontend as well.

**Changes**

* The public menu, footer, member dashboard, and admin dashboard now say What's On instead of Events.
* Page titles, help text, calendar filters, logs, and the changelog area label match that name. Website addresses still use /events so existing links keep working.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 45 unit tests and npm run validate. vite build. Typecheck still fails on pre-existing app errors. Browser E2E tools were not available.

## CHG-2026-1709-016 — Track and cap church emails at 50 per day and 1,000 per month

**Date:** 2026-09-17
**Time:** 20:02:05
**Timezone:** Pacific/Auckland
**Version:** 1.3.0
**Type:** Added

**Request**

> In the admin dashboard there needs to be somewhere to track the amount of emails that have been send from the site monthly, and daily. with a max of 1,000 emails per month, and 50 per day.

**Changes**

* Admin Overview and Emails now show used versus remaining against 50 emails per day and 1,000 per month in New Zealand time, with a progress bar and a pause banner when a cap is reached.
* A database function email_quota_status counts successful church Resend sends from email_sends for today and this month.
* Notify, delete-user, mfa, and mfa-login Edge Functions check that allowance before sending. When a cap is reached they stop the email, including 2FA codes. Account approve, hold, and delete still complete, and the admin sees why the email was not sent.
* Supabase Auth mail such as signup confirmation and password reset is not counted and is not stopped by this cap.

**Database**

* supabase/migrations/20260917080000_email_quota_status.sql

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 45 unit tests and npm run validate. vite build. Typecheck still fails on pre-existing app errors. SQL email_quota_status is live on the ABC Website database (13 of 50 today and 23 of 1,000 this month at apply time). Edge Functions still need a live deploy before sending is blocked in production.

## CHG-2026-1709-015 — Require a Hub ticket before any change in this repo

**Date:** 2026-09-17
**Time:** 20:01:12
**Timezone:** Pacific/Auckland
**Version:** 1.2.8
**Type:** Infrastructure

**Request**

> Before you do anything ensure you always create a ticket in the hub. THERE NEEDS TO BE SETTINGS SOMEWHERE SO THAT ANY CHANGES TO ANYTHING IN THIS REPO CREATES HUB TICKETS.

**Changes**

* AGENTS.md now requires a Hub session and a Hub ticket before inspect, plan, or implementation. Read-only work still does not need a ticket.
* Cursor always-apply rules tell agents to create and claim a ticket before Write, StrReplace, Delete, migrations, or commits.
* A project hook in .cursor/hooks.json blocks those file-edit tools when .hub-ticket-time.json has no current ticket, and tells the agent to run create-ticket then claim-ticket.
* create-ticket now stores the new ticket id locally so the hook can see it.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 45 unit tests including Hub ticket hook tests. npm run validate and vite build recorded on CHG-2026-1709-016.

## CHG-2026-1709-014 — Google accounts can disable 2FA without a stuck CAPTCHA

**Date:** 2026-09-17
**Time:** 03:22:21
**Timezone:** Pacific/Auckland
**Version:** 1.2.7
**Type:** Fixed

**Request**

> When trying to disable 2FA and email verification, the system says Unauthorized and/or Please fill the Captcha and does not allow me to continue. Why, and how to fix it?

**Changes**

* Google-only members no longer have to complete a CAPTCHA to disable authenticator or email verification. You are already signed in, so an authenticator or email code is enough.
* Disable requests now send a fresh sign-in token, so the page is less likely to show Unauthorized after you have already opened User Security.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 38 unit tests and npm run validate. vite build. Typecheck still fails on pre-existing app errors. Live mfa function redeployed after push. Browser E2E tools were not available.

## CHG-2026-1709-013 — Make Google-account email 2FA codes easier to receive

**Date:** 2026-09-17
**Time:** 03:02:44
**Timezone:** Pacific/Auckland
**Version:** 1.2.6
**Type:** Fixed

**Request**

> Authenticator app bypass worked for Google accounts, but email verification did not send a code after Send code, even though the password bypass worked.

**Changes**

* Email verification codes are now sent as both a normal email and a plain-text copy, with a unique header so Gmail does not hide a new code inside an earlier thread.
* The setup screen names the destination inbox, reminds you to check Spam and Promotions, and lets you send a new code without starting over.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 38 unit tests and npm run validate. vite build. Typecheck still fails on pre-existing app errors. Live mfa and mfa-login functions redeployed after push. Browser E2E tools were not available.

## CHG-2026-1709-012 — Google accounts can set up 2FA without a site password

**Date:** 2026-09-17
**Time:** 02:42:04
**Timezone:** Pacific/Auckland
**Version:** 1.2.5
**Type:** Fixed

**Request**

> When the account was created with Google, 2FA authenticator and email still require a password. Typing the Google account password is rejected as incorrect. Email/password sign-up does not have this issue. Fix it and push to live.

**Changes**

* Google-only accounts no longer have to enter a website password to set up authenticator or email 2FA. That Google password is not stored here and cannot be checked.
* Those members see a short explanation and continue from their signed-in session, plus the CAPTCHA. Members who signed up with email and password still confirm with that password.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 36 unit tests and npm run validate. vite build. Typecheck still fails on pre-existing app errors. Live mfa function redeployed after push so Google-only setup takes effect. Browser E2E tools were not available.

## CHG-2026-1709-011 — Show-password button on every password field

**Date:** 2026-09-17
**Time:** 02:32:04
**Timezone:** Pacific/Auckland
**Version:** 1.2.4
**Type:** Added

**Request**

> In all the places that require the user password in any part of the system, add a button to view password. Push to live.

**Changes**

* Password fields on sign in, sign up, reset password, and User Security now have a show/hide button so you can check what you typed.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 35 unit tests and npm run validate. vite build. Typecheck still fails on pre-existing app errors. Browser E2E tools were not available.

## CHG-2026-1709-010 — Keep forms and code screens when switching away from the tab

**Date:** 2026-09-17
**Time:** 02:17:47
**Timezone:** Pacific/Auckland
**Version:** 1.2.3
**Type:** Fixed

**Request**

> When receiving an email verification code and leaving the browser tab to read the email, coming back refreshes the screen and the code entry dialog disappears. This happens across the system whenever the browser tab loses focus.

**Changes**

* Returning to the tab no longer remounts the member or admin dashboard, so open dialogs and in-progress forms stay on screen.
* Dialogs ignore the accidental tap that often happens when you come back from another app, and authenticator and email setup only close with the X button.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 35 unit tests and npm run validate. vite build. Typecheck still fails on pre-existing app errors. Browser E2E tools were not available.

## CHG-2026-1709-009 — Authenticator QR and email MFA setup complete after password check

**Date:** 2026-09-17
**Time:** 02:03:01
**Timezone:** Pacific/Auckland
**Version:** 1.2.2
**Type:** Fixed
**Status:** Partial

**Request**

> After Setup Two-Factor Authentication, the password and human verification succeed but the Google Authenticator QR never appears and the code field is not shown. Email verification also never sends a code or shows the entry screen. Fix it and push to live.

**Changes**

* Live mfa now serves authenticator enroll/verify/disable, email enable/disable, recovery codes, and password change, so Continue can show the QR code and Send code can email a verification code.
* Live mfa-login now serves the full login challenge path so MFA cannot be skipped after a method is enabled.
* User Security shows setup errors inside the dialog, and authenticator setup only advances when the server returns a secret and otpauth URI.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 35 unit tests and npm run validate. vite build. Typecheck still fails on pre-existing app errors. Live mfa v3 and mfa-login v5 were deployed via Supabase MCP as GitHub source imports of commit fd77d74. First-request boot of those versions was not yet in function logs. Browser E2E tools were not available.

## CHG-2026-1709-008 — User Security loads after missing MFA function

**Date:** 2026-09-17
**Time:** 01:42:22
**Timezone:** Pacific/Auckland
**Version:** 1.2.1
**Type:** Fixed
**Status:** Partial

**Request**

> Fix the User Security left-menu page on the Member Dashboard showing Failed to send a request to the Edge Function and stuck on Loading security settings.

**Changes**

* Deployed the JWT-protected mfa Edge Function so User Security can load instead of a FunctionsFetchError from a missing function.
* User Security clears the error and shows Try again if settings fail to load, instead of staying on Loading security settings.
* Live mfa v2 serves status, session_status, and password change. Authenticator, email MFA, and recovery setup still need the full multi-file function deployed from the repo.
* Copied MFA helpers into supabase/functions/mfa/ next to index.ts so a later functions deploy can include them.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 35 unit tests and npm run validate. vite build. Typecheck still fails on pre-existing app errors. Live mfa listed ACTIVE v2 via Supabase MCP. Browser E2E tools were not available; refresh User Security after deploy to confirm the red banner is gone.

## CHG-2026-1709-007 — Member MFA with authenticator, email codes, and recovery

**Date:** 2026-09-17
**Time:** 01:25:42
**Timezone:** Pacific/Auckland
**Version:** 1.2.0
**Type:** Security
**Status:** Partial

**Request**

> Implement production MFA/2FA on Member Dashboard → User Security for approved members, with standard TOTP authenticator apps, email verification codes, recovery codes, login integration, rate limiting, audit events, migrations, tests, changelog, and SemVer.

**Changes**

* Added User Security under the member and admin dashboards for password change, authenticator (standard TOTP), email verification, and one-time recovery codes.
* Authenticator setup shows a standard otpauth QR code and manual key, and is enabled only after a valid 6-digit code is verified. Replacing the authenticator keeps the old method until the new one verifies.
* Email MFA sends a hashed, single-use 6-digit code through the existing Resend church email template, with expiry, attempt limits, and send throttling.
* Password login now goes through the mfa-login Edge Function. If MFA is enabled in the database, the client is supposed to challenge for TOTP, email, or a recovery code before the session is applied. Restrictive RLS requires a server-recorded MFA-verified session when MFA is on.
* Recovery codes are stored as salted hashes, shown once, and invalidated when regenerated. Trusted/remember-this-device was not added because church computers are often shared.
* Applied database migration member_mfa (user MFA settings, hashed email/recovery records, login challenges, verified sessions, rate-limit buckets, and mfa_session_satisfied RLS).
* 35 automated tests cover TOTP RFC 6238, replay and clock windows, hashing, AES-GCM secret wrapping, rate limits, authorization, and the MFA email template.
* Live mfa-login is currently a password-grant shim so sign-in keeps working. The full mfa and mfa-login sources are in the repo and still need `npx supabase functions deploy mfa` (JWT on) and `npx supabase functions deploy mfa-login --no-verify-jwt` before setup and MFA login challenges work in production.

**Database**

* supabase/migrations/20260916124100_member_mfa.sql

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: 35 unit tests passed. vite build passed. Typecheck still fails on pre-existing app errors and Deno Edge Function files, matching prior changelog practice. Migration member_mfa is applied on the ABC Website project. Browser E2E tools were not available. Live mfa-login v4 is password-grant only; the JWT mfa setup function is not deployed yet.

## CHG-2026-1709-006 — Open and close newsletter months with +

**Date:** 2026-09-17
**Time:** 00:54:52
**Timezone:** Pacific/Auckland
**Version:** 1.1.5
**Type:** Changed

**Request**

> Add a + in front of the Month to open and close the view for the newsletters of each month. puish to live

**Changes**

* Each month in the Newsletters archive now has a + in front of its name. Click it to open that month’s issues, or − to close them again.
* Months start closed so the boxed panel shows month names; open a month to read its newsletters.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Governance tests and changelog validation. Browser tools were not available; expand/collapse was checked in NewsletterMonthArchive.

## CHG-2026-1709-005 — Group newsletter archive by month

**Date:** 2026-09-17
**Time:** 00:48:30
**Timezone:** Pacific/Auckland
**Version:** 1.1.4
**Type:** Changed

**Request**

> On the Newsletter, group them by Month on the right Panel and just allow the last 4 months visible if the user want to see more they must roll the screen inside the square to see more options.

**Changes**

* The Newsletters archive on the right is grouped by month, newest month first.
* The archive sits in a boxed panel that shows the latest four months. Earlier months stay in the same list and are reached by scrolling inside the box.
* The same month grouping and scroll panel is used on member Newsletters and admin Newsletter Management.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Governance tests and changelog validation. Browser tools were not available; layout was checked in NewsletterMonthArchive, member Newsletter, and AdminNewsletter.

## CHG-2026-1709-004 — Restore left-menu name Overview

**Date:** 2026-09-17
**Time:** 00:36:41
**Timezone:** Pacific/Auckland
**Version:** 1.1.3
**Type:** Changed

**Request**

> Change back to Overview. push to live

**Changes**

* Restored the first left-menu item to Overview on the admin and member sidebars.
* Restored Help section titles, the Emails sent back link, and Changelog location headings to Overview.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Governance tests and changelog validation. Browser tools were not available; labels were checked in AdminLayout, DashboardLayout, Help, and Emails sent.

## CHG-2026-1709-003 — Rename left-menu Overview to Overviews

**Date:** 2026-09-17
**Time:** 00:32:27
**Timezone:** Pacific/Auckland
**Version:** 1.1.2
**Type:** Changed

**Request**

> Change the Overview from left side menu to Overviews. Push to live.

**Changes**

* Renamed the first left-menu item from Overview to Overviews on the admin and member sidebars.
* Matched Help page section titles, the Emails sent back link, and Changelog location headings to the new menu name.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Governance tests and changelog validation. Browser tools were not available; labels were checked in AdminLayout, DashboardLayout, Help, and Emails sent.

## CHG-2026-1709-002 — Push to live one-command GitHub deploy

**Date:** 2026-09-17
**Time:** 00:26:48
**Timezone:** Pacific/Auckland
**Version:** 1.1.1
**Type:** Added

**Request**

> When deploying live to GitHub, run git add ., git commit with updates changelogs DDMMYYYY, and git push -u origin main automatically from chat when the user writes Push to live, instead of approving many separate terminal commands.

**Changes**

* Added npm run push:live, which stages all tracked and untracked files (respecting .gitignore), commits with updates changelogs DDMMYYYY in Pacific/Auckland if there are changes, then pushes to origin main.
* Typing Push to live, push live, deploy live to GitHub, or go live in Cursor chat now runs that single command via a project rule and skill.
* This workspace allowlists git add/commit/push and npm so the Agent can run the deploy without a prompt for each command. .env stays untracked.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Governance tests and changelog validation. Did not run git add/commit/push as part of this change; say Push to live to send it to GitHub.

## CHG-2026-1709-001 — Overview email totals with day, week, and month detail

**Date:** 2026-09-17
**Time:** 00:04:28
**Timezone:** Pacific/Auckland
**Version:** 1.1.0
**Type:** Added

**Request**

> Add an Overview card for emails sent to users or Leadership. Show the all-time total on the card. When Manage is opened, show Day, Week, and Month quantities. Make Overview cards a professional layout, increase the card title description by 4px, include emails from when the church email service started, and update the card automatically when a new email is sent.

**Changes**

* Added an Emails Sent card on Admin Overview that shows the all-time total of church emails sent to users and Leadership.
* Manage opens a detail page with Day, Week, and Month counts, split by Users and Leadership, plus a full send history.
* Recorded outbound Resend emails in a new email_sends table, backfilled the 10 successful sends already stored in audit logs, and log each new send from the email Edge Functions.
* Deployed notify-user-approved, notify-user-review, notify-user-access-hold, notify-user-admin-role, notify-user-intro-inquiry, and delete-user so new emails increment the Overview total live.
* The Overview total refreshes automatically when a new email is recorded, and again when the page is focused.
* Tightened Overview card layout (equal height, icon beside title, pinned footer) and increased card title and description text by 4px to 18px on admin and member Overview.

**Database**

* supabase/migrations/20260916115500_create_email_sends.sql

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Governance tests, changelog validation, and vite build passed. email_sends was created and backfilled with 10 historical Resend sends. All six email Edge Functions were deployed ACTIVE on the ABC Website project.

## CHG-2026-1609-009 — Changelog location headings and detailed What-changed notes

**Date:** 2026-09-16
**Time:** 23:36:59
**Timezone:** Pacific/Auckland
**Version:** 1.0.0
**Type:** Changed

**Request**

> On the Changelog subtitle, do not show Website Update. Show the left-menu location where the change happened, or Internal App when it is not a menu page. Write detailed What changed bullets from the Cursor update notes, split for readability, and apply this to every Changelog register.

**Changes**

* Replaced generic Website Update headings with the admin or member left-menu category for that change (Overview, Annual Calendar, User Management, Prayers, Newsletters, Devotionals, Sermons, Leadership, Events, Rosters (Beta), System Setup, Help, Logs, or Changelog).
* When a change is not on a left-menu page, the heading now reads Internal App.
* Applied the same location heading to every curated CHANGELOG.json register and every GitHub-sourced register.
* What changed bullets now prefer the commit or request notes, then list the screens and files that were added, updated, or removed, with line counts when GitHub provides them.
* Long combined notes are split into shorter bullets so each register is easier to read.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Changelog helper tests plus changelog validation. Location headings are derived at display time from area, title, and changed files.

## CHG-2026-1609-008 — Professional Changelog register with day/month Change IDs

**Date:** 2026-09-16
**Time:** 22:59:10
**Timezone:** Pacific/Auckland
**Version:** 1.0.0
**Type:** Changed

**Request**

> Show Changelog as a professional register: Change ID titles, a clear description, and bullet points of what changed. Do not show GitHub commit URLs. Use [CHG-YYYY-DDMM-NNN] for every entry.

**Changes**

* Changed Change IDs from month/day to day/month (example [CHG-2026-1609-001]).
* Re-numbered every existing changelog register to the new format, oldest-first within each day.
* Changelog list now shows the Change ID as the title, a short heading, a summary, and What changed bullets.
* Removed GitHub commit URLs from the Changelog view; GitHub updates are summarised in plain language.
* Excel and PDF exports use the same Change ID, description, and bullet format.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Changelog helper tests updated for DDMM Change IDs.

## CHG-2026-1609-007 — Development governance, changelog, and CI validation

**Date:** 2026-09-16
**Time:** 22:30:04
**Timezone:** Pacific/Auckland
**Version:** 1.0.0
**Type:** Infrastructure

**Request**

> Make a final architectural decision and implement production-grade development governance: changelog, Change IDs, semantic versioning, migration validation, testing, GitHub Actions, and a mandatory agent workflow.

**Changes**

* Added AGENTS.md as the authoritative AI development-governance document.
* Created CHANGELOG.json as the canonical machine-readable history and CHANGELOG.md as the generated human-readable form.
* Migrated all 60 existing Super Admin product-changelog entries from lib/changelog.ts, preserving original IDs, titles, summaries, details, authors, areas, and timestamps.
* Added Change ID generation (CHG-YYYY-DDMM-NNN) and validation that changelog Markdown and JSON stay synchronized.
* Set package.json to 1.0.0 as the first official SemVer and the single version source.
* Added Node validation scripts for changelog, version, migrations, and requiring a changelog update when application files change.
* Added a GitHub Actions CI workflow that runs validation, governance tests, and the production build.
* Pointed the Super Admin changelog UI at CHANGELOG.json instead of a second curated list.
* Documented supabase/migrations/ for new SQL; left historical root SQL files in place.
* Stopped tracking .env and added .env.example so secrets are not committed going forward.

**Database**

* None

**Validation**

* Unit tests: passed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: passed
* Notes: Governance tests (node --test) and vite build were executed. Project-wide tsc already fails on pre-existing application errors unrelated to this change. No ESLint config exists. No application integration or e2e suite exists.

## CHG-2026-1609-006 — Changelog year, month, and date range filters

**Date:** 2026-09-16
**Time:** 19:20:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Super Admins can narrow the Changelog by calendar year, month, and/or a from–to date range. Exports include only the filtered rows.

**Changes**

* Super Admins can narrow the Changelog by calendar year, month, and/or a from–to date range. Exports include only the filtered rows.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1609-005 — Changelog text contrast on light background

**Date:** 2026-09-16
**Time:** 19:08:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Changelog titles, summaries, and meta text use explicit dark colours so they stay readable on the white admin surface.

**Changes**

* Changelog titles, summaries, and meta text use explicit dark colours so they stay readable on the white admin surface.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1609-004 — Clearer Changelog timeline layout

**Date:** 2026-09-16
**Time:** 18:58:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Changelog entries use a vertical timeline with a clear title, typed badges, and a tidy footer for when, who, and area.

**Changes**

* Month headers show how many updates are in that period.
* Type badges include icons so colour is not the only cue.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1609-003 — Export Changelog to Excel and PDF

**Date:** 2026-09-16
**Time:** 18:53:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Super Admins can download the changelog as Excel (CSV) or PDF. Exports include only the rows matching the current type, area, and search filters.

**Changes**

* Export buttons sit in the Changelog page header, next to the title.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1609-002 — Changelog shows date, time, and who made each change

**Date:** 2026-09-16
**Time:** 18:49:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Every changelog row now includes the exact day and time the change shipped and the person or team who made it.

**Changes**

* Times display in your admin timezone (same as System Logs).
* Search includes the user name as well as title and summary.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1609-001 — Super Admin Changelog tab in the admin dashboard

**Date:** 2026-09-16
**Time:** 18:30:16
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> A Changelog tab sits next to Logs in the admin left menu. Only Super Admins can see or open it.

**Changes**

* Regular admins do not see the tab and are redirected to Overview if they guess the URL.
* Filter by type, area, or search. Entries are grouped by month.
* This is the product history — live activity still lives under Logs.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1509-003 — Hold Access for existing accounts

**Date:** 2026-09-15
**Time:** 02:35:23
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins can place website access on hold for security, separate from first-time pending approval.

**Changes**

* Held users see a distinct pending-access screen instead of the member portal.
* An email notifies the person when access is held.
* User Management includes a Held filter, export status, and restore flow.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1509-002 — Emails when admin access is granted or removed

**Date:** 2026-09-15
**Time:** 02:13:50
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Promoting or demoting an admin now sends a confirmation email to that person.

**Changes**

* Promoting or demoting an admin now sends a confirmation email to that person.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1409-004 — Delete a user from User Management

**Date:** 2026-09-14
**Time:** 23:55:07
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins can remove an account after confirmation. The person receives an email confirming deletion.

**Changes**

* You cannot delete your own account while signed in.
* Super Admin and the Appdoers service account cannot be deleted.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1509-004 — Export User Management lists to CSV and PDF

**Date:** 2026-09-15
**Time:** 02:48:09
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Download the currently visible user list with role, status, leadership link, and join date.

**Changes**

* Download the currently visible user list with role, status, leadership link, and join date.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1409-003 — Annual Calendar in admin and member portals

**Date:** 2026-09-14
**Time:** 23:10:29
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> A year / month / week calendar shows events, sermons, devotionals, and newsletters together.

**Changes**

* Coloured markers distinguish item types. Open a day, then tap an item to view it.
* The calendar updates when events, devotionals, or newsletters change.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1409-001 — Newsletters match devotionals: title, week date, latest-first archive

**Date:** 2026-09-14
**Time:** 19:05:44
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Admin newsletter publishing now uses a title and week date, with newest issues listed first.

**Changes**

* Admin newsletter publishing now uses a title and week date, with newest issues listed first.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1409-002 — Sidebar labels and icons for Prayers and Newsletters

**Date:** 2026-09-14
**Time:** 22:28:05
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Prayers uses a praying-hands icon; Newsletters has a distinct newspaper icon and colour.

**Changes**

* Prayers uses a praying-hands icon; Newsletters has a distinct newspaper icon and colour.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1509-006 — Shared page headers across admin and member sections

**Date:** 2026-09-15
**Time:** 03:14:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Left-menu pages use a consistent title, subtitle, and icon header.

**Changes**

* Left-menu pages use a consistent title, subtitle, and icon header.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1509-001 — Pending approval, OAuth, and HashRouter reliability

**Date:** 2026-09-15
**Time:** 00:53:03
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Sign-in callbacks, password recovery, and the pending-approval screen no longer drop people on a blank or looping page.

**Changes**

* Sign-in callbacks, password recovery, and the pending-approval screen no longer drop people on a blank or looping page.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1509-005 — Leadership linking from User Management

**Date:** 2026-09-15
**Time:** 03:09:05
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Link a login to a Leadership person so ministry memberships and rosters apply. Recheck matches or pick a person by hand.

**Changes**

* Link a login to a Leadership person so ministry memberships and rosters apply. Recheck matches or pick a person by hand.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2808-001 — Watch Sermons page in the member dashboard

**Date:** 2026-08-28
**Time:** 10:15:25
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Members can watch the church YouTube sermons from inside the member portal.

**Changes**

* Members can watch the church YouTube sermons from inside the member portal.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2808-002 — Overview card typography

**Date:** 2026-08-28
**Time:** 10:19:04
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Overview titles and labels are easier to read; all-caps labels are no longer forced.

**Changes**

* Overview titles and labels are easier to read; all-caps labels are no longer forced.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2708-003 — Devotional of the Week with in-page PDF reader

**Date:** 2026-08-27
**Time:** 15:53:00
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins upload a weekly PDF with title, subtitle, and week date. Members read it in the portal viewer — no download or new-tab link.

**Changes**

* Admins can edit an existing issue or replace the PDF.
* Upload drafts persist if you leave the form and come back.
* Archives are scrollable and listed newest first.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2708-005 — PDF viewer blank screens, flicker, and mobile layout

**Date:** 2026-08-27
**Time:** 16:39:13
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Leaving a PDF, switching tabs, or reading on a phone no longer whites out the page or flashes the document.

**Changes**

* Leaving a PDF, switching tabs, or reading on a phone no longer whites out the page or flashes the document.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2308-001 — Cloudflare Turnstile on sign-in and admin email actions

**Date:** 2026-08-23
**Time:** 14:11:14
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> CAPTCHA protects login, signup, password reset, and related admin email flows from automated abuse.

**Changes**

* CAPTCHA protects login, signup, password reset, and related admin email flows from automated abuse.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2708-001 — User Management actions collapsed into a dropdown

**Date:** 2026-08-27
**Time:** 15:23:49
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Pending user rows fit on smaller screens; actions sit in a single menu per person.

**Changes**

* Pending user rows fit on smaller screens; actions sit in a single menu per person.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2708-002 — Clear errors when approval emails fail

**Date:** 2026-08-27
**Time:** 15:29:16
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> If an approval or review email cannot send, the admin sees the failure instead of a silent miss.

**Changes**

* If an approval or review email cannot send, the admin sees the failure instead of a silent miss.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2708-004 — Clearer multi-day event schedules

**Date:** 2026-08-27
**Time:** 16:23:22
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Event pages show start and end dates and times without unreadable contrast.

**Changes**

* Event pages show start and end dates and times without unreadable contrast.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2606-001 — Community Lunch removed from event categories

**Date:** 2026-06-26
**Time:** 10:35:46
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Community Lunch is no longer listed as an event category across the site.

**Changes**

* Community Lunch is no longer listed as an event category across the site.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2306-003 — Verse of the day on the member dashboard

**Date:** 2026-06-23
**Time:** 20:23:38
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> The member Overview rotates a daily verse drawn from the ACTS Prayers set.

**Changes**

* The member Overview rotates a daily verse drawn from the ACTS Prayers set.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2306-002 — System Logs audit trail

**Date:** 2026-06-23
**Time:** 20:08:23
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins can review sign-ins, sign-ups, admin changes, member activity, and RSVPs, then filter and export to CSV.

**Changes**

* Database triggers record many table changes automatically.
* Logs cannot be edited or deleted in the portal.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2306-001 — Event posters display at the right size without stretching

**Date:** 2026-06-23
**Time:** 19:49:21
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Calendar cards, detail pages, and uploads use a 16:9 poster. Any photo format is accepted; the Watch Online button links correctly.

**Changes**

* Calendar cards, detail pages, and uploads use a 16:9 poster. Any photo format is accepted; the Watch Online button links correctly.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2206-001 — Production domain, SEO, and leadership pages

**Date:** 2026-06-22
**Time:** 19:45:28
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> The live site uses ashburtonbaptist.co.nz with search metadata. Placeholder leadership pages were removed.

**Changes**

* The live site uses ashburtonbaptist.co.nz with search metadata. Placeholder leadership pages were removed.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2106-004 — Admin and member dashboards work on phones

**Date:** 2026-06-21
**Time:** 19:24:16
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Mobile layouts scroll and stack correctly without changing the desktop layout.

**Changes**

* Mobile layouts scroll and stack correctly without changing the desktop layout.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2106-003 — Password reset works with HashRouter and recovery tokens

**Date:** 2026-06-21
**Time:** 18:43:59
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Reset links from email complete on the HashRouter site. Mobile no longer hangs on an infinite loading state.

**Changes**

* Reset links from email complete on the HashRouter site. Mobile no longer hangs on an infinite loading state.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2106-002 — Shared event calendar grid for admin and members

**Date:** 2026-06-21
**Time:** 18:24:06
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Admin and member event calendars use the same grid, cards, and category filters.

**Changes**

* Admin and member event calendars use the same grid, cards, and category filters.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2106-001 — Statement of Faith page

**Date:** 2026-06-21
**Time:** 16:46:36
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> The public beliefs page publishes the adopted church document, with a congregation photo hero and a mobile article picker.

**Changes**

* The public beliefs page publishes the adopted church document, with a congregation photo hero and a mobile article picker.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1806-006 — Contact form connect-card fields and direct pastor email

**Date:** 2026-06-18
**Time:** 16:50:55
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> The contact form is a multi-step connect card (first/last name, optional phone, spouse, extra details) and emails the pastor directly.

**Changes**

* NZ mobile, landline, and toll-free numbers are accepted.
* Need Prayer was simplified; the Contact navbar dropdown was removed.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1806-007 — Email-only signup with confirmation

**Date:** 2026-06-18
**Time:** 18:05:17
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> People sign up with email, receive a branded confirmation message, and can complete signup even if they try again.

**Changes**

* People sign up with email, receive a branded confirmation message, and can complete signup even if they try again.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1806-008 — Giving page bank details and coming-soon online giving

**Date:** 2026-06-18
**Time:** 18:26:31
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> The Giving page shows the correct bank account. Give Securely opens a coming-soon message until online giving is ready.

**Changes**

* The Giving page shows the correct bank account. Give Securely opens a coming-soon message until online giving is ready.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1806-003 — Teens & Youth events page

**Date:** 2026-06-18
**Time:** 12:43:17
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> A Tuesday 7pm Teens & Youth category and public page were added to Events.

**Changes**

* A Tuesday 7pm Teens & Youth category and public page were added to Events.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1806-001 — Sermons playlist filter and title search

**Date:** 2026-06-18
**Time:** 12:09:39
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Watch Sermons can filter by playlist and search titles. Search no longer matches the description, and the dropdown stacks cleanly on mobile.

**Changes**

* Watch Sermons can filter by playlist and search titles. Search no longer matches the description, and the dropdown stacks cleanly on mobile.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1806-004 — Kids Programme time set to 10am

**Date:** 2026-06-18
**Time:** 16:42:11
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Kids Programme copy uses 10am, and event contact buttons consistently say Get in touch.

**Changes**

* Kids Programme copy uses 10am, and event contact buttons consistently say Get in touch.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1806-009 — Appdoers service account hidden from other admins

**Date:** 2026-06-18
**Time:** 18:45:56
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> The Super Admin service account no longer appears in other admins’ user lists.

**Changes**

* The Super Admin service account no longer appears in other admins’ user lists.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1806-002 — History page content visible on mobile

**Date:** 2026-06-18
**Time:** 12:12:41
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> The History timeline no longer renders blank on phones; hover is scoped to cards.

**Changes**

* The History timeline no longer renders blank on phones; hover is scoped to cards.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1806-005 — I’m New location link and visitor PDF coming soon

**Date:** 2026-06-18
**Time:** 16:42:21
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Church location uses a direct Google Maps place link. The new-visitor PDF download shows coming soon when the file is not available.

**Changes**

* Church location uses a direct Google Maps place link. The new-visitor PDF download shows coming soon when the file is not available.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2704-005 — Rosters per ministry with date ranges

**Date:** 2026-04-27
**Time:** 14:29:22
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins upload a roster PDF for a ministry (group) covering a from–to date range. Members only see rosters for ministries they belong to.

**Changes**

* Dashboard Roster shows a ministry list, then roster details and PDF preview.
* Published rosters can be edited (ministry, dates, or replacement file).
* Leader name and photo come from the matching “<Group> Leader” job role.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2704-004 — Event categories managed in System Setup

**Date:** 2026-04-27
**Time:** 13:58:59
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins add, edit, disable, or delete event categories the same way as Groups and Job Roles. Event forms load the live list.

**Changes**

* Admins add, edit, disable, or delete event categories the same way as Groups and Job Roles. Event forms load the live list.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2704-003 — Forgot password and admin-sent password reset

**Date:** 2026-04-27
**Time:** 13:52:21
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Login has Forgot password? Admins can send a reset link from User Management. People set a new password on the recovery page.

**Changes**

* Login has Forgot password? Admins can send a reset link from User Management. People set a new password on the recovery page.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2704-002 — RSVP search and directory-styled CSV/PDF export

**Date:** 2026-04-27
**Time:** 13:51:31
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> Admins can search RSVPs by name or email and export only the filtered rows, styled like the Leadership directory export.

**Changes**

* Admins can search RSVPs by name or email and export only the filtered rows, styled like the Leadership directory export.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2704-001 — Leadership groups, job roles, filters, and export

**Date:** 2026-04-27
**Time:** 12:14:58
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> System Setup stores Groups and Job Roles. The Leadership table filters by staff/member/attendee and exports CSV or PDF.

**Changes**

* Member dashboard Leadership shows staff only.
* Linking a login to a Leadership person is opt-in and re-checkable.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2704-007 — Help pages for admin and member portals

**Date:** 2026-04-27
**Time:** 16:47:25
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Each left-menu area has a short explanation of what it is for and typical tasks.

**Changes**

* Each left-menu area has a short explanation of what it is for and typical tasks.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2704-008 — Photos section removed from admin

**Date:** 2026-04-27
**Time:** 17:07:28
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> The Photos tile and routes were taken out of the admin portal.

**Changes**

* The Photos tile and routes were taken out of the admin portal.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2704-006 — I’m praying button refreshes the count

**Date:** 2026-04-27
**Time:** 14:30:40
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Tapping I’m praying on the prayer wall updates the count without a stale refresh.

**Changes**

* Tapping I’m praying on the prayer wall updates the count without a stale refresh.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1604-001 — Super Admin role and first/last name

**Date:** 2026-04-16
**Time:** 20:49:20
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> The Super Admin account is protected. Any approved admin can promote or demote other admins. Profiles store first and last name.

**Changes**

* View as Member moved from the login page into the dashboard sidebars.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1404-003 — Events: images, detail pages, RSVP, and audience

**Date:** 2026-04-14
**Time:** 20:39:38
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins upload event images, set audience (staff / members / attendees / all), and optionally collect RSVPs. Public events have a See More detail page.

**Changes**

* Missing images fall back to the church logo banner.
* Public events stay visible to everyone; private events stay in the dashboards.
* Calendar cards, RSVP flow, and admin event list were polished for production.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1404-001 — Admin Leadership directory table

**Date:** 2026-04-14
**Time:** 19:35:56
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Leadership is an Excel-style table with richer people profiles and export, instead of cards only.

**Changes**

* Leadership is an Excel-style table with richer people profiles and export, instead of cards only.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1404-002 — OAuth callback no longer 404s on refresh

**Date:** 2026-04-14
**Time:** 20:06:43
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> Google sign-in return URLs survive a page refresh on the HashRouter app.

**Changes**

* Google sign-in return URLs survive a page refresh on the HashRouter app.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-1304-001 — Public Watch Sermons with YouTube embeds

**Date:** 2026-04-13
**Time:** 08:03:07
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> The public Sermons page embeds the church YouTube channel so visitors can watch messages.

**Changes**

* The public Sermons page embeds the church YouTube channel so visitors can watch messages.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-0102-001 — Public pages match the home visual language

**Date:** 2026-02-01
**Time:** 19:54:54
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Changed

**Request**

> FAQ accordions animate smoothly; scroll icons align on laptop and mobile.

**Changes**

* FAQ accordions animate smoothly; scroll icons align on laptop and mobile.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-2401-001 — Admin layout works on smaller screens

**Date:** 2026-01-24
**Time:** 19:28:11
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Fixed

**Request**

> The admin sidebar collapses to a menu on phones.

**Changes**

* The admin sidebar collapses to a menu on phones.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2026-0201-001 — Leadership photo upload and descriptions

**Date:** 2026-01-02
**Time:** 20:35:52
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Admins upload a photo file instead of pasting a URL, and can add a description used on public leadership pages.

**Changes**

* Admins upload a photo file instead of pasting a URL, and can add a description used on public leadership pages.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2025-2112-002 — Admin and member dashboards, prayer wall, and user management

**Date:** 2025-12-21
**Time:** 19:11:01
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> Signed-in people land in a dashboard. Admins get Overview, User Management, and tools to run the site.

**Changes**

* Prayer wall for submitting and supporting requests.
* Roster PDFs, team members, dates and timezones, and skeleton loading states.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.

## CHG-2025-2112-001 — Public church website and History page

**Date:** 2025-12-21
**Time:** 18:12:45
**Timezone:** Pacific/Auckland
**Version:** 0.0.0
**Type:** Added

**Request**

> The public site launched with Home, About, Events, I’m New, Giving, Need Prayer, Contact, and History, plus the first admin dashboard.

**Changes**

* The public site launched with Home, About, Events, I’m New, Giving, Need Prayer, Contact, and History, plus the first admin dashboard.

**Database**

* None

**Validation**

* Unit tests: not run or failed
* Integration tests: not run or failed
* End-to-end tests: not run or failed
* Type checking: not run or failed
* Lint: not run or failed
* Build: not run or failed
* Notes: Migrated from the pre-governance product changelog in lib/changelog.ts. Validation was not recorded at the time.
