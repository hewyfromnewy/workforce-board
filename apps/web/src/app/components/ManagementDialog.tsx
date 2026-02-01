import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Plus, Trash2, User, Package, MapPin } from 'lucide-react';
import { Tag } from './RosterBoard';

interface ManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holdingTags: Tag[];
  onAddTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
  locations: string[];
  onUpdateLocations: (locations: string[]) => void;
}

export function ManagementDialog({
  open,
  onOpenChange,
  holdingTags,
  onAddTag,
  onDeleteTag,
  locations,
  onUpdateLocations,
}: ManagementDialogProps) {
  const [newMemberName, setNewMemberName] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      onAddTag({
        id: `m-${Date.now()}`,
        name: newMemberName.trim(),
        type: 'member',
      });
      setNewMemberName('');
    }
  };

  const handleAddAsset = () => {
    if (newAssetName.trim()) {
      onAddTag({
        id: `a-${Date.now()}`,
        name: newAssetName.trim(),
        type: 'asset',
      });
      setNewAssetName('');
    }
  };

  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      onUpdateLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const handleDeleteLocation = (location: string) => {
    onUpdateLocations(locations.filter(l => l !== location));
  };

  const members = holdingTags.filter(t => t.type === 'member');
  const assets = holdingTags.filter(t => t.type === 'asset');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Roster</DialogTitle>
          <DialogDescription>Manage team members, assets, and locations.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="members" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">
              <User className="w-4 h-4 mr-2" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="assets">
              <Package className="w-4 h-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="locations">
              <MapPin className="w-4 h-4 mr-2" />
              Locations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                  placeholder="Enter team member name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Available Team Members ({members.length})</p>
                {members.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No team members yet</p>
                ) : (
                  <div className="space-y-1">
                    {members.map(tag => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-amber-600" />
                          <span className="text-sm">{tag.name}</span>
                        </div>
                        <button
                          onClick={() => onDeleteTag(tag.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAsset()}
                  placeholder="Enter asset name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddAsset}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Available Assets ({assets.length})</p>
                {assets.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No assets yet</p>
                ) : (
                  <div className="space-y-1">
                    {assets.map(tag => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{tag.name}</span>
                        </div>
                        <button
                          onClick={() => onDeleteTag(tag.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="locations" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                  placeholder="Enter location name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddLocation}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Locations ({locations.length})</p>
                {locations.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No locations yet</p>
                ) : (
                  <div className="space-y-1">
                    {locations.map((location, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">{location}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteLocation(location)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}