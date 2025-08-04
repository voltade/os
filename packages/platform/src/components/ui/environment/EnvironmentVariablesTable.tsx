import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Stack,
  Table,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
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

  const { data: environmentVariables = [], refetch } =
    useEnvironmentVariables(environmentId);

  // Only fetch secrets when editing
  const { data: environmentVariablesWithSecrets } =
    useEnvironmentVariablesWithSecrets(environmentId, { enabled: !!editingId });
  const createMutation = useCreateEnvironmentVariable();
  const updateMutation = useUpdateEnvironmentVariable();
  const deleteMutation = useDeleteEnvironmentVariable();

  const newVariableForm = useForm({
    initialValues: {
      name: '',
      description: '',
      value: '',
    },
    validate: {
      name: (value) =>
        /^[A-Z_][A-Z0-9_]*$/.test(value)
          ? null
          : 'Name must contain only uppercase letters, numbers, and underscores, starting with a letter or underscore',
      value: (value) => (value.trim() ? null : 'Value is required'),
    },
  });

  const editForm = useForm({
    initialValues: {
      name: '',
      description: '',
      value: '',
    },
    validate: {
      name: (value) =>
        /^[A-Z_][A-Z0-9_]*$/.test(value)
          ? null
          : 'Name must contain only uppercase letters, numbers, and underscores, starting with a letter or underscore',
      value: (value) => (value.trim() ? null : 'Value is required'),
    },
  });

  const handleCreate = async (values: typeof newVariableForm.values) => {
    try {
      await createMutation.mutateAsync({
        environment_id: environmentId,
        name: values.name,
        description: values.description || null,
        value: values.value,
      });
      showSuccess('Environment variable created successfully');
      newVariableForm.reset();
      setIsCreating(false);
      refetch();
    } catch (error) {
      showError(`Failed to create environment variable: ${error}`);
    }
  };

  const handleUpdate = async (id: string, values: typeof editForm.values) => {
    try {
      await updateMutation.mutateAsync({
        id,
        name: values.name,
        description: values.description || null,
        value: values.value,
      });
      showSuccess('Environment variable updated successfully');
      setEditingId(null);
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
    editForm.setValues({
      name: variable.name,
      description: variable.description || '',
      value: '', // Will be set when secrets are loaded
    });
  };

  // Update edit form when secrets are loaded
  // biome-ignore lint/correctness/useExhaustiveDependencies: to prevent infinite re-renders
  useEffect(() => {
    if (editingId && environmentVariablesWithSecrets) {
      const variableWithSecret = environmentVariablesWithSecrets.find(
        (v) => v.id === editingId,
      );
      if (variableWithSecret) {
        editForm.setValues({
          name: variableWithSecret.name,
          description: variableWithSecret.description || '',
          value: variableWithSecret.value,
        });
      }
    }
  }, [editingId, environmentVariablesWithSecrets]);

  const cancelEditing = () => {
    setEditingId(null);
    editForm.reset();
  };

  const cancelCreating = () => {
    setIsCreating(false);
    newVariableForm.reset();
  };

  return (
    <Stack>
      <Group justify="space-between">
        <h2>Environment Variables</h2>
        <Group>
          <Menu>
            <Menu.Target>
              <Button variant="light" leftSection={<IconDots size={16} />}>
                Bulk Actions
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconUpload size={16} />}
                onClick={() => setBulkImportOpen(true)}
              >
                Import Variables
              </Menu.Item>
              <Menu.Item
                leftSection={<IconDownload size={16} />}
                onClick={() => setBulkExportOpen(true)}
                disabled={environmentVariables.length === 0}
              >
                Export Variables
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            Add Variable
          </Button>
        </Group>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Value</Table.Th>
            <Table.Th style={{ width: 100 }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isCreating && (
            <Table.Tr>
              <Table.Td>
                <TextInput
                  placeholder="VARIABLE_NAME"
                  {...newVariableForm.getInputProps('name')}
                  size="sm"
                />
              </Table.Td>
              <Table.Td>
                <TextInput
                  placeholder="Description (optional)"
                  {...newVariableForm.getInputProps('description')}
                  size="sm"
                />
              </Table.Td>
              <Table.Td>
                <Textarea
                  placeholder="Variable value"
                  {...newVariableForm.getInputProps('value')}
                  size="sm"
                  autosize
                  minRows={1}
                />
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Tooltip label="Save">
                    <ActionIcon
                      color="green"
                      variant="light"
                      onClick={() => {
                        if (newVariableForm.isValid()) {
                          handleCreate(newVariableForm.values);
                        }
                      }}
                      loading={createMutation.isPending}
                    >
                      <IconCheck size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Cancel">
                    <ActionIcon
                      color="gray"
                      variant="light"
                      onClick={cancelCreating}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          )}
          {environmentVariables.map((variable) => (
            <Table.Tr key={variable.id}>
              <Table.Td>
                {editingId === variable.id ? (
                  <TextInput {...editForm.getInputProps('name')} size="sm" />
                ) : (
                  <span className="font-mono">{variable.name}</span>
                )}
              </Table.Td>
              <Table.Td>
                {editingId === variable.id ? (
                  <TextInput
                    {...editForm.getInputProps('description')}
                    size="sm"
                  />
                ) : (
                  variable.description || '—'
                )}
              </Table.Td>
              <Table.Td>
                {editingId === variable.id ? (
                  <Textarea
                    {...editForm.getInputProps('value')}
                    size="sm"
                    autosize
                    minRows={1}
                  />
                ) : (
                  <span className="font-mono text-gray-500">••••••••</span>
                )}
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  {editingId === variable.id ? (
                    <>
                      <Tooltip label="Save">
                        <ActionIcon
                          color="green"
                          variant="light"
                          onClick={() => {
                            if (editForm.isValid()) {
                              handleUpdate(variable.id, editForm.values);
                            }
                          }}
                          loading={updateMutation.isPending}
                        >
                          <IconCheck size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Cancel">
                        <ActionIcon
                          color="gray"
                          variant="light"
                          onClick={cancelEditing}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip label="Edit">
                        <ActionIcon
                          variant="light"
                          onClick={() => startEditing(variable)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => handleDelete(variable.id)}
                          loading={deleteMutation.isPending}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {environmentVariables.length === 0 && !isCreating && (
        <div className="text-center py-8 text-gray-500">
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
    </Stack>
  );
}
