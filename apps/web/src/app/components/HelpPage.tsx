import { PlayCircle } from 'lucide-react';
import { useAccess } from '@/app/access';

const topics: { question: string; answer: string }[] = [
  {
    question: 'How do I add my team members, plant and locations?',
    answer:
      'Open Manage in the menu. Type a name and press Add, or choose "Paste a list" and put one name on each line. Team members, assets (your own plant and vehicles) and hire and contractors each have their own list. For locations, add the job number after a comma, like Irrawang, 14525.',
  },
  {
    question: 'How do I put someone on the board?',
    answer:
      'Drag their tag from "Not on the roster" into a cell. The row is the location and the column is the category. Dropping a tag somewhere else moves it. A tag can only be in one place on a day.',
  },
  {
    question: 'How do I find someone in "Not on the roster"?',
    answer:
      'Type part of their name in the search box at the top of that list. Clear the box to see everyone again.',
  },
  {
    question: 'How do I get more room for the board?',
    answer:
      'Use the arrows at the top of the menu to shrink it to icons. Use them again to bring the names back. The board remembers your choice.',
  },
  {
    question: 'How do I take someone off the board?',
    answer:
      'Use the small cross on their tag, or drag the tag back into "Not on the roster".',
  },
  {
    question: 'How do I add a handwritten note, like "x3" or "on hold"?',
    answer:
      'Select "+ note" at the bottom of a cell, type, and press Enter. Select the note again to change it. Clear the text to remove it.',
  },
  {
    question: 'How do I copy yesterday\'s roster?',
    answer:
      'Choose "Copy from another day" next to the date. It starts from the day before; pick a different date if you need to, such as last Friday for a Monday. If the day already has a roster, the copy replaces it.',
  },
  {
    question: 'How do I put an operator on a plant item?',
    answer:
      'First drag the plant item into a cell. It then shows a "Drop a person here" slot. Drag a team member onto that slot. Each person you add gets their own line, so a truck can have a driver and an offsider. They also show in the PERSONNEL column for that location, marked with the plant item they are on. Moving the plant item moves its people with it, and taking it off the board returns them to "Not on the roster". The message you send lists them in brackets after the item, and under PERSONNEL.',
  },
  {
    question: 'How do I name the supervisors for the day?',
    answer: 'Drag them onto the Supervisors line, above the board. They appear first in the message when you send.',
  },
  {
    question: 'How do I look at another day?',
    answer:
      'Use the arrows next to the date, or choose a date. Each day has its own roster. Today takes you back to today.',
  },
  {
    question: 'What does Send do?',
    answer:
      'It shows you the message first. Then you choose Copy text or Open WhatsApp. The roster is then marked "Sent" with the time. Sending does not lock the day, so you can keep editing.',
  },
  {
    question: 'What does "Changed since sent" mean?',
    answer:
      'You changed the roster after you sent it, so the people who got the message have an out-of-date version. Send again to tell them. Every day you have sent is listed under Sent history.',
  },
  {
    question: 'I removed something by mistake.',
    answer:
      'A message appears at the top right with an Undo button for a few seconds. Choose it straight away to bring the item back.',
  },
  {
    question: 'Who can do what?',
    answer:
      'Admins can do everything, including managing the lists and users. Supervisors can plan the roster and send it. Team members can look at the roster but not change it.',
  },
  {
    question: 'Where is my information kept?',
    answer:
      'With a login, it is saved to your team\'s account, so you see the same board on every device. Without one, the board is saved only in this browser on this device.',
  },
];

export function HelpPage({ onStartTour }: { onStartTour: () => void }) {
  const { user } = useAccess();

  return (
    <div className="h-full overflow-auto">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Help</h1>
        <p className="text-sm text-gray-500">Short answers to common questions.</p>
      </header>
      <div className="p-4 space-y-4 max-w-3xl">
        <section className="bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <h2 className="font-semibold text-gray-900">Take the tour</h2>
            <p className="text-sm text-gray-600">A one-minute walk around the roster, highlighting each part.</p>
          </div>
          <button
            type="button"
            onClick={onStartTour}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <PlayCircle className="w-4 h-4" aria-hidden />
            Start the tour
          </button>
        </section>

        <section aria-label="Questions and answers" className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-100">
          {topics.map(topic => (
            <details key={topic.question} className="group px-4 py-3">
              <summary className="cursor-pointer font-medium text-gray-900">{topic.question}</summary>
              <p className="mt-2 text-sm text-gray-700">{topic.answer}</p>
            </details>
          ))}
        </section>

        {user && (
          <p className="text-sm text-gray-500">
            You are signed in as {user.name}. Questions about your account or something that is not working? Ask your admin.
          </p>
        )}
      </div>
    </div>
  );
}
