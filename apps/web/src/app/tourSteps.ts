import type { Permission } from '@workforce/shared';

export interface TourStep {
  id: string;
  target?: string;
  title: string;
  body: string;
  permission?: Permission;
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Daily Roster Board',
    body: 'This replaces the whiteboard. Here is a quick look around, about a minute. You can replay it any time from Help in the menu.',
  },
  {
    id: 'manage',
    target: '[data-tour="nav-manage"]',
    title: 'Start in Manage',
    body: 'Add your team members, assets, hire gear and locations here. You can paste a whole list at once, one per line. For locations, put the job number after a comma, like Irrawang, 14525.',
    permission: 'master_data.manage',
  },
  {
    id: 'date',
    target: '[data-tour="date"]',
    title: 'Pick the day',
    body: 'Every day has its own roster. Use the arrows or the date box to move between days, and Today to come back to today.',
  },
  {
    id: 'waiting',
    target: '[data-tour="waiting"]',
    title: 'Not on the roster',
    body: 'Everyone and everything you have not placed yet today: team members, assets, and hire or contractors. Drag a tag from here onto the board.',
  },
  {
    id: 'board',
    target: '[data-tour="board"]',
    title: 'The board',
    body: 'Each row is a location, with its job number in red. Each column is a category. Drop a tag into a cell. Use "+ note" in a cell for handwritten notes like "x3" or "on hold". The cross on a tag takes it off again.',
  },
  {
    id: 'supervisors',
    target: '[data-tour="supervisors"]',
    title: 'Supervisors',
    body: 'Drag the supervisors for the day onto this line. They are included at the top of the message when you send the roster.',
  },
  {
    id: 'send',
    target: '[data-tour="send"]',
    title: 'Send the roster',
    body: 'Send shows you the message first, then copies it or opens WhatsApp. If you change the roster after sending, the board says "Changed since sent" so you know to send it again.',
    permission: 'roster.send',
  },
  {
    id: 'help',
    target: '[data-tour="nav-help"]',
    title: 'Need this again?',
    body: 'Help has short answers to common questions, and you can take this tour again from there.',
  },
];
