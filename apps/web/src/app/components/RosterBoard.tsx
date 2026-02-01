import { useState, useEffect, useRef } from 'react';
import { Plus, Download, Settings, Calendar, Send, Users, Package } from 'lucide-react';
import { format as formatDate } from 'date-fns';
import { toast } from 'sonner';
import { RosterHeader } from './RosterHeader';
import { RosterGrid } from './RosterGrid';
import { HoldingArea } from './HoldingArea';
import { ManagementDialog } from './ManagementDialog';
import { ExportDialog } from './ExportDialog';
import type { Tag, Category } from '@workforce/shared';

// Re-export types for backwards compatibility with other components
export type { Tag, Category } from '@workforce/shared';

const STORAGE_KEY = 'workforce-roster-data';

const defaultCategories: Category[] = [
  { id: 'personnel', name: 'PERSONNEL', tags: [] },
  { id: 'plant', name: 'PLANT', tags: [] },
  { id: 'traffic-control', name: 'TRAFFIC CONTROL', tags: [] },
  { id: 'contractors', name: 'CONTRACTORS', tags: [] },
  { id: 'leave', name: 'LEAVE', tags: [] },
  { id: 'training', name: 'TRAINING', tags: [] },
];

const defaultLocations = [
  'Cameron Town',
  'Kurangiaro',
  'Kurakura Rd',
  'Fly Point Rd',
  'Tomorrows Stockpile',
  'Shine Bay Car Park',
];

const sampleMembers: Tag[] = [
  { id: 'm1', name: 'John Smith', type: 'member' },
  { id: 'm2', name: 'Sarah Johnson', type: 'member' },
  { id: 'm3', name: 'Mike Davis', type: 'member' },
  { id: 'm4', name: 'Emma Wilson', type: 'member' },
  { id: 'm5', name: 'Chris Brown', type: 'member' },
  { id: 'm6', name: 'Lisa Anderson', type: 'member' },
  { id: 'm7', name: 'Tom Martinez', type: 'member' },
  { id: 'm8', name: 'Amy Taylor', type: 'member' },
];

const sampleAssets: Tag[] = [
  { id: 'a1', name: 'Excavator #1', type: 'asset' },
  { id: 'a2', name: 'Truck #23', type: 'asset' },
  { id: 'a3', name: 'Forklift #5', type: 'asset' },
  { id: 'a4', name: 'Roller #8', type: 'asset' },
  { id: 'a5', name: 'Grader #12', type: 'asset' },
];

export function RosterBoard() {
  const [date, setDate] = useState<Date>(new Date());
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [locations, setLocations] = useState<string[]>(defaultLocations);
  const [holdingTags, setHoldingTags] = useState<Tag[]>([]);
  const [managementOpen, setManagementOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  
  // Use refs to track current state for drag operations
  const categoriesRef = useRef(categories);
  const holdingTagsRef = useRef(holdingTags);
  
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);
  
  useEffect(() => {
    holdingTagsRef.current = holdingTags;
  }, [holdingTags]);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.categories) setCategories(data.categories);
        if (data.locations) setLocations(data.locations);
        if (data.holdingTags) setHoldingTags(data.holdingTags);
        if (data.date) setDate(new Date(data.date));
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    } else {
      // Initialize with sample data
      setHoldingTags([...sampleMembers, ...sampleAssets]);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const data = {
      categories,
      locations,
      holdingTags,
      date: date.toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [categories, locations, holdingTags, date]);

  const moveTag = (tagId: string, fromCategoryId: string | null, toCategoryId: string | null, locationIndex?: number) => {
    // Use refs to get current state
    let tagToMove: Tag | undefined;
    let actualFromCategoryId = fromCategoryId;

    // Find the tag using refs for current state
    if (fromCategoryId === null) {
      tagToMove = holdingTagsRef.current.find(t => t.id === tagId);
    } else {
      const category = categoriesRef.current.find(c => c.id === fromCategoryId);
      tagToMove = category?.tags.find(t => t.id === tagId);
    }

    // If not found in expected location, search everywhere using refs
    if (!tagToMove) {
      tagToMove = holdingTagsRef.current.find(t => t.id === tagId);
      if (tagToMove) {
        actualFromCategoryId = null;
      }
    }

    if (!tagToMove) {
      for (const cat of categoriesRef.current) {
        const found = cat.tags.find(t => t.id === tagId);
        if (found) {
          tagToMove = found;
          actualFromCategoryId = cat.id;
          break;
        }
      }
    }

    if (!tagToMove) {
      console.error('Tag not found anywhere:', tagId);
      return;
    }

    // Now update both states with the found tag
    const updatedTag = { ...tagToMove, locationIndex };

    // Update holding tags
    setHoldingTags(prev => {
      let newTags = prev;
      
      // Remove from holding if that's the source
      if (actualFromCategoryId === null) {
        newTags = prev.filter(t => t.id !== tagId);
      }
      
      // Add to holding if that's the destination
      if (toCategoryId === null) {
        const { locationIndex: _, ...tagWithoutLocation } = updatedTag;
        newTags = [...newTags, tagWithoutLocation];
      }
      
      return newTags;
    });

    // Update categories
    setCategories(prev => {
      let newCategories = prev;
      
      // Remove from source category
      if (actualFromCategoryId !== null) {
        newCategories = prev.map(cat =>
          cat.id === actualFromCategoryId
            ? { ...cat, tags: cat.tags.filter(t => t.id !== tagId) }
            : cat
        );
      }
      
      // Add to destination category
      if (toCategoryId !== null) {
        newCategories = newCategories.map(cat =>
          cat.id === toCategoryId
            ? { ...cat, tags: [...cat.tags, updatedTag] }
            : cat
        );
      }
      
      return newCategories;
    });
  };

  const findTag = (tagId: string, categoryId: string | null): Tag | undefined => {
    if (categoryId === null) {
      return holdingTags.find(t => t.id === tagId);
    }
    const category = categories.find(c => c.id === categoryId);
    return category?.tags.find(t => t.id === tagId);
  };

  const handleExport = (format: 'text' | 'whatsapp' | 'screenshot') => {
    if (format === 'screenshot') {
      // Inform user to use browser's built-in screenshot
      toast.info('Please use your browser\'s screenshot tool (Ctrl+Shift+S or Cmd+Shift+4) to capture the roster grid.');
      return;
    }

    const dateStr = formatDate(date, 'EEE dd/MM/yy');
    let output = `📋 DAILY ROSTER - ${dateStr}\n\n`;

    // Locations section
    if (locations.length > 0) {
      output += `📍 LOCATIONS:\n`;
      locations.forEach(location => {
        output += `   • ${location}\n`;
      });
      output += '\n';
    }

    // Categories
    categories.forEach(cat => {
      if (cat.tags.length > 0) {
        output += `${cat.name}:\n`;
        const members = cat.tags.filter(t => t.type === 'member');
        const assets = cat.tags.filter(t => t.type === 'asset');

        if (members.length > 0) {
          members.forEach(tag => {
            output += `   👤 ${tag.name}\n`;
          });
        }
        if (assets.length > 0) {
          assets.forEach(tag => {
            output += `   📦 ${tag.name}\n`;
          });
        }
        output += '\n';
      }
    });

    // Summary
    const totalMembers = categories.reduce((sum, cat) => sum + cat.tags.filter(t => t.type === 'member').length, 0);
    const totalAssets = categories.reduce((sum, cat) => sum + cat.tags.filter(t => t.type === 'asset').length, 0);
    output += `───────────────────\n`;
    output += `Total: ${totalMembers} Personnel | ${totalAssets} Assets\n`;

    if (format === 'text') {
      // Try modern clipboard API first, with fallback
      const copyToClipboard = async () => {
        try {
          await navigator.clipboard.writeText(output);
          toast.success('Roster copied to clipboard!');
        } catch (err) {
          // Fallback method using textarea
          const textarea = document.createElement('textarea');
          textarea.value = output;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          
          try {
            const successful = document.execCommand('copy');
            if (successful) {
              toast.success('Roster copied to clipboard!');
            } else {
              toast.error('Failed to copy to clipboard');
            }
          } catch (execErr) {
            console.error('Fallback copy failed:', execErr);
            toast.error('Failed to copy to clipboard');
          }
          
          document.body.removeChild(textarea);
        }
      };
      
      copyToClipboard();
    } else if (format === 'whatsapp') {
      // Open WhatsApp with pre-filled message
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(output)}`;
      window.open(whatsappUrl, '_blank');
      toast.success('Opening WhatsApp...');
    }
  };

  const handleAddTag = (tag: Tag) => {
    setHoldingTags(prev => [...prev, tag]);
    toast.success(`${tag.type === 'member' ? 'Team member' : 'Asset'} added`);
  };

  const handleDeleteTag = (tagId: string) => {
    setHoldingTags(prev => prev.filter(t => t.id !== tagId));
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        tags: cat.tags.filter(t => t.id !== tagId),
      }))
    );
    toast.success('Tag deleted');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <RosterHeader
        date={date}
        onDateChange={setDate}
        onManageClick={() => setManagementOpen(true)}
        onExportClick={() => setExportOpen(true)}
      />

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 p-4">
        {/* Main Board Area - Spreadsheet Grid */}
        <div className="flex-1 overflow-auto bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4">
            <RosterGrid
              categories={categories}
              locations={locations}
              onDrop={moveTag}
            />
          </div>
        </div>

        {/* Holding Area */}
        <HoldingArea
          tags={holdingTags}
          onDrop={moveTag}
          onAddTag={handleAddTag}
          onDeleteTag={handleDeleteTag}
        />
      </div>

      {/* Management Dialog */}
      <ManagementDialog
        open={managementOpen}
        onOpenChange={setManagementOpen}
        holdingTags={holdingTags}
        onAddTag={handleAddTag}
        onDeleteTag={handleDeleteTag}
        locations={locations}
        onUpdateLocations={setLocations}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        onExport={handleExport}
      />
    </div>
  );
}