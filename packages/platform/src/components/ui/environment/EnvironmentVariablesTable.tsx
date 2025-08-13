import {
  IconCheck,
  IconDots,
  IconDownload,
  IconEdit,
  IconPlus,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import {
  showError,
  showSuccess,
} from '#src/components/utils/notifications.tsx';
import {
  useCreateEnvironmentVariable,
  useDeleteEnvironmentVariable,
  useEnvironmentVariables,
  useEnvironmentVariablesWithSecrets,
  useUpdateEnvironmentVariable,
} from '#src/hooks/environment_variable.ts';
import { BulkExportModal } from './BulkExportModal.tsx';
import { BulkImportModal } from './BulkImportModal.tsx';

interface EnvironmentVariable {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  organization_id: string;
  environment_id: string;
  secret_id: string | null;
}

interface EnvironmentVariablesTableProps {
  environmentId: string;
}

export function EnvironmentVariablesTable({
  environmentId,
}: EnvironmentVariablesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkExportOpen, setBulkExportOpen] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  const { data: environmentVariables = [], refetch } =
    useEnvironmentVariables(environmentId);

  // Only fetch secrets when editing
  const { data: environmentVariablesWithSecrets } =
    useEnvironmentVariablesWithSecrets(environmentId, { enabled: !!editingId });
  const createMutation = useCreateEnvironmentVariable();
  const updateMutation = useUpdateEnvironmentVariable();
  const deleteMutation = useDeleteEnvironmentVariable();

  // Local state to replace useForm
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newValue, setNewValue] = useState('');

  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editValue, setEditValue] = useState('');

  const resetCreate = () => {
    setNewName('');
    setNewDescription('');
    setNewValue('');
  };

  const resetEdit = () => {
    setEditName('');
    setEditDescription('');
    setEditValue('');
  };

  const validateVar = (name: string, value: string): string | null => {
    if (!/^[A-Z_][A-Z0-9_]*$/.test(name)) {
      return 'Name must contain only uppercase letters, numbers, and underscores, starting with a letter or underscore';
    }
    if (!value.trim()) {
      return 'Value is required';
    }
    return null;
  };

  const handleCreate = async () => {
    const errorMsg = validateVar(newName, newValue);
    if (errorMsg) {
      showError(errorMsg);
      return;
    }
    try {
      await createMutation.mutateAsync({
        environment_id: environmentId,
        name: newName,
        description: newDescription || null,
        value: newValue,
      });
      showSuccess('Environment variable created successfully');
      resetCreate();
      setIsCreating(false);
      refetch();
    } catch (error) {
      showError(`Failed to create environment variable: ${error}`);
    }
  };

  const handleUpdate = async (id: string) => {
    const errorMsg = validateVar(editName, editValue);
    if (errorMsg) {
      showError(errorMsg);
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id,
        name: editName,
        description: editDescription || null,
        value: editValue,
      });
      showSuccess('Environment variable updated successfully');
      setEditingId(null);
      resetEdit();
      refetch();
    } catch (error) {
      showError(`Failed to update environment variable: ${error}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showSuccess('Environment variable deleted successfully');
      refetch();
    } catch (error) {
      showError(`Failed to delete environment variable: ${error}`);
    }
  };

  const startEditing = (variable: EnvironmentVariable) => {
    setEditingId(variable.id);
    setEditName(variable.name);
    setEditDescription(variable.description || '');
    setEditValue(''); // Will be set when secrets are loaded
  };

  // Update edit state when secrets are loaded
  useEffect(() => {
    if (editingId && environmentVariablesWithSecrets) {
      const variableWithSecret = environmentVariablesWithSecrets.find(
        (v) => v.id === editingId,
      );
      if (variableWithSecret) {
        setEditName(variableWithSecret.name);
        setEditDescription(variableWithSecret.description || '');
        setEditValue(variableWithSecret.value);
      }
    }
  }, [editingId, environmentVariablesWithSecrets]);

  const cancelEditing = () => {
    setEditingId(null);
    resetEdit();
  };

  const cancelCreating = () => {
    setIsCreating(false);
    resetCreate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Environment Variables
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setBulkMenuOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent"
            >
              <IconDots size={16} />
              Bulk Actions
            </button>
            {bulkMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow">
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    setBulkImportOpen(true);
                    setBulkMenuOpen(false);
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <IconUpload size={16} /> Import Variables
                  </span>
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
                  disabled={environmentVariables.length === 0}
                  onClick={() => {
                    setBulkExportOpen(true);
                    setBulkMenuOpen(false);
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <IconDownload size={16} /> Export Variables
                  </span>
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 disabled:opacity-50"
          >
            <IconPlus size={16} /> Add Variable
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 font-medium">Value</th>
              <th className="px-3 py-2 font-medium" style={{ width: 120 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isCreating && (
              <tr>
                <td className="px-3 py-2 align-top">
                  <input
                    placeholder="VARIABLE_NAME"
                    className="w-full rounded-md border bg-background px-2 py-1 font-mono text-sm outline-none ring-0 focus:border-ring"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <input
                    placeholder="Description (optional)"
                    className="w-full rounded-md border bg-background px-2 py-1 text-sm outline-none ring-0 focus:border-ring"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <textarea
                    placeholder="Variable value"
                    className="w-full rounded-md border bg-background px-2 py-1 text-sm outline-none ring-0 focus:border-ring"
                    rows={1}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Save"
                      onClick={handleCreate}
                      className="inline-flex items-center justify-center rounded-md border border-green-600 bg-green-50 p-1 text-green-600 hover:bg-green-100"
                    >
                      {createMutation.isPending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                      ) : (
                        <IconCheck size={16} />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Cancel"
                      onClick={cancelCreating}
                      className="inline-flex items-center justify-center rounded-md border p-1 hover:bg-accent"
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {environmentVariables.map((variable) => (
              <tr key={variable.id}>
                <td className="px-3 py-2 align-top">
                  {editingId === variable.id ? (
                    <input
                      className="w-full rounded-md border bg-background px-2 py-1 font-mono text-sm outline-none ring-0 focus:border-ring"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    <span className="font-mono">{variable.name}</span>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {editingId === variable.id ? (
                    <input
                      className="w-full rounded-md border bg-background px-2 py-1 text-sm outline-none ring-0 focus:border-ring"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  ) : (
                    variable.description || '—'
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {editingId === variable.id ? (
                    <textarea
                      className="w-full rounded-md border bg-background px-2 py-1 text-sm outline-none ring-0 focus:border-ring"
                      rows={1}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    <span className="font-mono text-muted-foreground">
                      ••••••••
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="flex items-center gap-2">
                    {editingId === variable.id ? (
                      <>
                        <button
                          type="button"
                          title="Save"
                          onClick={() => handleUpdate(variable.id)}
                          className="inline-flex items-center justify-center rounded-md border border-green-600 bg-green-50 p-1 text-green-600 hover:bg-green-100"
                        >
                          {updateMutation.isPending ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                          ) : (
                            <IconCheck size={16} />
                          )}
                        </button>
                        <button
                          type="button"
                          title="Cancel"
                          onClick={cancelEditing}
                          className="inline-flex items-center justify-center rounded-md border p-1 hover:bg-accent"
                        >
                          <IconX size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => startEditing(variable)}
                          className="inline-flex items-center justify-center rounded-md border p-1 hover:bg-accent"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDelete(variable.id)}
                          className="inline-flex items-center justify-center rounded-md border border-destructive bg-destructive/10 p-1 text-destructive hover:bg-destructive/20"
                        >
                          {deleteMutation.isPending ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <IconTrash size={16} />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {environmentVariables.length === 0 && !isCreating && (
        <div className="py-8 text-center text-muted-foreground">
          No environment variables found. Click "Add Variable" to create one.
        </div>
      )}

      <BulkImportModal
        environmentId={environmentId}
        opened={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onSuccess={() => {
          setBulkImportOpen(false);
          refetch();
        }}
      />

      <BulkExportModal
        environmentId={environmentId}
        opened={bulkExportOpen}
        onClose={() => setBulkExportOpen(false)}
      />
    </div>
  );
}
