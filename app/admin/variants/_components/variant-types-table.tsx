'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type VariantType = {
  id: number;
  name: string;
  options: {
    id: number;
    value: string;
  }[];
};

export function VariantTypesTable() {
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [variantTypeToDelete, setVariantTypeToDelete] = useState<{ id: number; name: string } | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<number[]>([]);
  const [newOptionValue, setNewOptionValue] = useState('');
  const [addingOptionForType, setAddingOptionForType] = useState<number | null>(null);
  const [addingOption, setAddingOption] = useState(false);
  const [deletingOptionId, setDeletingOptionId] = useState<number | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    fetchVariantTypes();
  }, []);

  const fetchVariantTypes = async () => {
    try {
      const response = await fetch('/api/admin/variants/types');
      if (!response.ok) throw new Error('Failed to fetch variant types');
      const data = await response.json();
      setVariantTypes(data);
    } catch (error) {
      console.error('Error fetching variant types:', error);
      toast.error('Failed to load variant types');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedTypes(prev => 
      prev.includes(id) 
        ? prev.filter(typeId => typeId !== id)
        : [...prev, id]
    );
  };

  const handleDeleteClick = (variantType: VariantType) => {
    setVariantTypeToDelete({ id: variantType.id, name: variantType.name });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!variantTypeToDelete) return;
    
    try {
      setDeletingId(variantTypeToDelete.id);
      const response = await fetch(`/api/admin/variants/types/${variantTypeToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete variant type');
      }

      toast.success('Variant type deleted successfully');
      fetchVariantTypes();
    } catch (error) {
      console.error('Error deleting variant type:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete variant type');
    } finally {
      setDeletingId(null);
      setShowDeleteDialog(false);
      setVariantTypeToDelete(null);
    }
  };

  const handleAddOption = async (variantTypeId: number) => {
    if (!newOptionValue.trim()) return;
    
    try {
      setAddingOption(true);
      const response = await fetch(`/api/admin/variants/types/${variantTypeId}/options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: newOptionValue.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add option');
      }

      toast.success('Option added successfully');
      setNewOptionValue('');
      fetchVariantTypes();
    } catch (error) {
      console.error('Error adding option:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add option');
    } finally {
      setAddingOption(false);
      setAddingOptionForType(null);
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    try {
      setDeletingOptionId(optionId);
      const response = await fetch(`/api/admin/variants/options/${optionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete option');
      }

      toast.success('Option deleted successfully');
      fetchVariantTypes();
    } catch (error) {
      console.error('Error deleting option:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete option');
    } finally {
      setDeletingOptionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (variantTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No variant types found. Create your first variant type to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Options</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variantTypes.map((variantType) => {
            const isExpanded = expandedTypes.includes(variantType.id);
            const isAddingOption = addingOptionForType === variantType.id;
            
            return (
              <React.Fragment key={variantType.id}>
                <TableRow className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => toggleExpand(variantType.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <span>{variantType.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {variantType.options.slice(0, 3).map(option => (
                        <Badge key={option.id} variant="outline">
                          {option.value}
                        </Badge>
                      ))}
                      {variantType.options.length > 3 && (
                        <Badge variant="outline" className="bg-muted">
                          +{variantType.options.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/variants/${variantType.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(variantType)}
                        disabled={deletingId === variantType.id}
                      >
                        {deletingId === variantType.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={3} className="p-0 bg-muted/20">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium">Options</h4>
                          {!isAddingOption ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAddingOptionForType(variantType.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Option
                            </Button>
                          ) : null}
                        </div>
                        
                        {isAddingOption && (
                          <div className="flex space-x-2 mb-4">
                            <Input
                              placeholder="Enter option value"
                              value={newOptionValue}
                              onChange={(e) => setNewOptionValue(e.target.value)}
                              className="max-w-xs"
                              autoFocus
                            />
                            <Button 
                              onClick={() => handleAddOption(variantType.id)}
                              disabled={!newOptionValue.trim() || addingOption}
                            >
                              {addingOption ? 'Adding...' : 'Add'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setAddingOptionForType(null);
                                setNewOptionValue('');
                              }}
                              disabled={addingOption}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {variantType.options.map((option) => (
                            <div 
                              key={option.id}
                              className="flex items-center justify-between p-2 border rounded-md bg-background"
                            >
                              <span>{option.value}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteOption(option.id)}
                                disabled={deletingOptionId === option.id}
                              >
                                {deletingOptionId === option.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                                <span className="sr-only">Delete option</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the variant type "{variantTypeToDelete?.name}" and all its options. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingId !== null}
            >
              {deletingId ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
