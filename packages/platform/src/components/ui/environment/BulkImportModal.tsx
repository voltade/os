import {
  Alert,
  Button,
  Group,
  List,
  Modal,
  Progress,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';

import {
  showError,
  showSuccess,
} from '#src/components/utils/notifications.tsx';
import { useBulkCreateEnvironmentVariables } from '#src/hooks/environment_variable.ts';

interface BulkImportModalProps {
  environmentId: string;
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedVariable {
  name: string;
  value: string;
  description?: string;
}

export function BulkImportModal({
  environmentId,
  opened,
  onClose,
  onSuccess,
}: BulkImportModalProps) {
  const [parsedVariables, setParsedVariables] = useState<ParsedVariable[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState(0);

  const bulkCreateMutation = useBulkCreateEnvironmentVariables();

  const form = useForm({
    initialValues: {
      content: '',
    },
  });

  const parseContent = (
    content: string,
  ): { variables: ParsedVariable[]; errors: string[] } => {
    const variables: ParsedVariable[] = [];
    const errors: string[] = [];
    const lines = content.split('\n').filter((line) => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip comments and empty lines
      if (line.startsWith('#') || !line) continue;

      // Check for different formats
      if (line.includes('=')) {
        // KEY=value format
        const [name, ...valueParts] = line.split('=');
        const value = valueParts.join('='); // Handle values with = in them

        if (!name.trim()) {
          errors.push(`Line ${i + 1}: Missing variable name`);
          continue;
        }

        if (!/^[A-Z_][A-Z0-9_]*$/.test(name.trim())) {
          errors.push(
            `Line ${i + 1}: Invalid variable name "${name.trim()}". Must contain only uppercase letters, numbers, and underscores, starting with a letter or underscore`,
          );
          continue;
        }

        variables.push({
          name: name.trim(),
          value: value.replace(/^["']|["']$/g, ''), // Remove surrounding quotes
        });
      } else {
        errors.push(`Line ${i + 1}: Invalid format. Expected KEY=value`);
      }
    }

    return { variables, errors };
  };

  const handlePreview = () => {
    const { variables, errors } = parseContent(form.values.content);
    setParsedVariables(variables);
    setParseErrors(errors);
  };

  const handleImport = async () => {
    try {
      setImportProgress(0);

      const variablesToCreate = parsedVariables.map((variable) => ({
        environment_id: environmentId,
        name: variable.name,
        description: variable.description || null,
        value: variable.value,
      }));

      await bulkCreateMutation.mutateAsync(variablesToCreate, {
        onSuccess: () => {
          setImportProgress(100);
          showSuccess(
            `Successfully imported ${parsedVariables.length} environment variables`,
          );
          onSuccess();
          handleClose();
        },
      });
    } catch (error) {
      showError(`Failed to import environment variables: ${error}`);
    }
  };

  const handleClose = () => {
    form.reset();
    setParsedVariables([]);
    setParseErrors([]);
    setImportProgress(0);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Bulk Import Environment Variables"
      size="lg"
    >
      <Stack>
        <Alert icon={<IconInfoCircle size={16} />} color="blue">
          <Text size="sm">Paste your environment variables in the format:</Text>
          <Text size="sm" className="font-mono mt-2">
            VARIABLE_NAME=value
            <br />
            ANOTHER_VAR="value with spaces"
            <br /># Comments are ignored
          </Text>
        </Alert>

        <Textarea
          label="Environment Variables"
          placeholder={`DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY=your_api_key_here
DEBUG=true
# This is a comment`}
          minRows={8}
          {...form.getInputProps('content')}
        />

        <Group>
          <Button
            variant="light"
            onClick={handlePreview}
            disabled={!form.values.content.trim()}
          >
            Preview
          </Button>
        </Group>

        {parseErrors.length > 0 && (
          <Alert color="red" title="Parse Errors">
            <List size="sm">
              {parseErrors.map((error) => (
                <List.Item key={error}>{error}</List.Item>
              ))}
            </List>
          </Alert>
        )}

        {parsedVariables.length > 0 && (
          <Alert
            color="green"
            title={`Found ${parsedVariables.length} variables`}
          >
            <List size="sm">
              {parsedVariables.slice(0, 5).map((variable) => (
                <List.Item key={variable.name} className="font-mono">
                  {variable.name}={variable.value.substring(0, 20)}
                  {variable.value.length > 20 ? '...' : ''}
                </List.Item>
              ))}
              {parsedVariables.length > 5 && (
                <List.Item key="more-items">
                  ... and {parsedVariables.length - 5} more
                </List.Item>
              )}
            </List>
          </Alert>
        )}

        {importProgress > 0 && importProgress < 100 && (
          <Progress value={importProgress} animated />
        )}

        <Group justify="flex-end">
          <Button variant="light" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            leftSection={<IconUpload size={16} />}
            onClick={handleImport}
            disabled={parsedVariables.length === 0 || parseErrors.length > 0}
            loading={bulkCreateMutation.isPending}
          >
            Import {parsedVariables.length} Variables
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
