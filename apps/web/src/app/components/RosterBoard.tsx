import { useState, useEffect, useRef } from 'react';
import { format as formatDate } from 'date-fns';
import { toast } from 'sonner';
import { RosterHeader } from './RosterHeader';
import { RosterGrid } from './RosterGrid';
import { HoldingArea } from './HoldingArea';
import { ManagementDialog } from './ManagementDialog';
import { ExportDialog } from './ExportDialog';
import type { Tag, Category } from '@workforce/shared';
import {
  defaultCategories,
  defaultLocations,
  sampleMembers,
  sampleAssets,
} from '@/app/config/defaults';
import { moveTag as moveTagInState, addTag, deleteTag, buildRosterText } from '@/app/lib/roster';
import { loadState, saveState } from '@/app/lib/storage';

// Re-export types for backwards compatibility with other components
export type { Tag, Category } from '@workforce/shared';

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
    const data = loadState(localStorage);
    if (data) {
      if (data.categories) setCategories(data.categories);
      if (data.locations) setLocations(data.locations);
      if (data.holdingTags) setHoldingTags(data.holdingTags);
      if (data.date) setDate(new Date(data.date));
    } else {
      // Initialize with sample data
      setHoldingTags([...sampleMembers, ...sampleAssets]);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveState(localStorage, {
      categories,
      locations,
      holdingTags,
      date: date.toISOString(),
    });
  }, [categories, locations, holdingTags, date]);

  const applyState = (next: { categories: Category[]; holdingTags: Tag[] }) => {
    // Update refs immediately so rapid successive drags see fresh state
    categoriesRef.current = next.categories;
    holdingTagsRef.current = next.holdingTags;
    setCategories(next.categories);
    setHoldingTags(next.holdingTags);
  };

  const moveTag = (tagId: string, fromCategoryId: string | null, toCategoryId: string | null, locationIndex?: number) => {
    const current = { categories: categoriesRef.current, holdingTags: holdingTagsRef.current };
    const next = moveTagInState(current, tagId, fromCategoryId, toCategoryId, locationIndex);
    if (next === current) {
      console.error('Tag not found anywhere:', tagId);
      return;
    }
    applyState(next);
  };

  const handleExport = (format: 'text' | 'whatsapp' | 'screenshot') => {
    if (format === 'screenshot') {
      // Inform user to use browser's built-in screenshot
      toast.info('Please use your browser\'s screenshot tool (Ctrl+Shift+S or Cmd+Shift+4) to capture the roster grid.');
      return;
    }

    const output = buildRosterText(formatDate(date, 'EEE dd/MM/yy'), categories, locations);

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
    applyState(addTag({ categories: categoriesRef.current, holdingTags: holdingTagsRef.current }, tag));
    toast.success(`${tag.type === 'member' ? 'Team member' : 'Asset'} added`);
  };

  const handleDeleteTag = (tagId: string) => {
    applyState(deleteTag({ categories: categoriesRef.current, holdingTags: holdingTagsRef.current }, tagId));
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