import {
  Alert,
  Button,
  Checkbox,
  Group,
  Modal,
  Radio,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDownload, IconInfoCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { showSuccess } from '#src/components/utils/notifications.tsx';
import { useEnvironmentVariablesWithSecrets } from '#src/hooks/environment_variable.ts';

interface BulkExportModalProps {
  environmentId: string;
  opened: boolean;
  onClose: () => void;
}

type ExportFormat = 'env' | 'json' | 'yaml';

export function BulkExportModal({
  environmentId,
  opened,
  onClose,
}: BulkExportModalProps) {
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);

  const { data: environmentVariables = [], isLoading } =
    useEnvironmentVariablesWithSecrets(environmentId, { enabled: opened });

  // Update selected variables when data loads
  useEffect(() => {
    if (environmentVariables.length > 0 && selectedVariables.length === 0) {
      setSelectedVariables(environmentVariables.map((v) => v.id));
    }
  }, [environmentVariables, selectedVariables.length]);

  const form = useForm({
    initialValues: {
      format: 'env' as ExportFormat,
      includeComments: true,
    },
  });

  const generateExportContent = (): string => {
    const selectedVars = environmentVariables.filter((v) =>
      selectedVariables.includes(v.id),
    );

    switch (form.values.format) {
      case 'env':
        return selectedVars
          .map((v) => {
            let content = '';
            if (form.values.includeComments && v.description) {
              content += `# ${v.description}\n`;
            }
            // Escape values that contain spaces or special characters
            const needsQuotes = /[\s"'\\$`]/.test(v.value);
            const escapedValue = needsQuotes
              ? `"${v.value.replace(/"/g, '\\"')}"`
              : v.value;
            content += `${v.name}=${escapedValue}`;
            return content;
          })
          .join('\n');

      case 'json': {
        const jsonObj = selectedVars.reduce(
          (acc, v) => {
            acc[v.name] = v.value;
            return acc;
          },
          {} as Record<string, string>,
        );
        return JSON.stringify(jsonObj, null, 2);
      }

      case 'yaml':
        return selectedVars
          .map((v) => {
            let content = '';
            if (form.values.includeComments && v.description) {
              content += `# ${v.description}\n`;
            }
            // YAML string escaping
            const needsQuotes =
              /[:\-?[\]{},'"|>*&!%@`]/.test(v.value) ||
              v.value.trim() !== v.value;
            const yamlValue = needsQuotes
              ? `"${v.value.replace(/"/g, '\\"')}"`
              : v.value;
            content += `${v.name}: ${yamlValue}`;
            return content;
          })
          .join('\n');

      default:
        return '';
    }
  };

  const handleDownload = () => {
    const content = generateExportContent();
    const fileExtension =
      form.values.format === 'env' ? '.env' : `.${form.values.format}`;
    const fileName = `environment-variables${fileExtension}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSuccess(
      `Exported ${selectedVariables.length} environment variables to ${fileName}`,
    );
    onClose();
  };

  const handleCopyToClipboard = async () => {
    const content = generateExportContent();
    try {
      await navigator.clipboard.writeText(content);
      showSuccess('Environment variables copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const toggleVariable = (variableId: string) => {
    setSelectedVariables((prev) =>
      prev.includes(variableId)
        ? prev.filter((id) => id !== variableId)
        : [...prev, variableId],
    );
  };

  const toggleAll = () => {
    setSelectedVariables((prev) =>
      prev.length === environmentVariables.length
        ? []
        : environmentVariables.map((v) => v.id),
    );
  };

  const exportContent = generateExportContent();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Export Environment Variables"
      size="lg"
    >
      <Stack>
        {isLoading && (
          <Text size="sm" c="dimmed">
            Loading environment variables...
          </Text>
        )}

        <div>
          <Text size="sm" fw={500} mb="xs">
            Export Format
          </Text>
          <Radio.Group {...form.getInputProps('format')}>
            <Stack gap="xs">
              <Radio value="env" label=".env file format" />
              <Radio value="json" label="JSON format" />
              <Radio value="yaml" label="YAML format" />
            </Stack>
          </Radio.Group>
        </div>

        {form.values.format !== 'json' && (
          <Checkbox
            label="Include descriptions as comments"
            {...form.getInputProps('includeComments', { type: 'checkbox' })}
          />
        )}

        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Select Variables
            </Text>
            <Button variant="subtle" size="xs" onClick={toggleAll}>
              {selectedVariables.length === environmentVariables.length
                ? 'Deselect All'
                : 'Select All'}
            </Button>
          </Group>
          <Stack gap="xs" mah={200} style={{ overflow: 'auto' }}>
            {environmentVariables.map((variable) => (
              <Checkbox
                key={variable.id}
                label={
                  <div>
                    <Text size="sm" className="font-mono">
                      {variable.name}
                    </Text>
                    {variable.description && (
                      <Text size="xs" c="dimmed">
                        {variable.description}
                      </Text>
                    )}
                  </div>
                }
                checked={selectedVariables.includes(variable.id)}
                onChange={() => toggleVariable(variable.id)}
              />
            ))}
          </Stack>
        </div>

        {selectedVariables.length > 0 && (
          <>
            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              <Text size="sm">
                Preview of exported content ({selectedVariables.length}{' '}
                variables):
              </Text>
            </Alert>

            <Textarea
              value={exportContent}
              readOnly
              minRows={8}
              maxRows={15}
              className="font-mono text-xs"
            />
          </>
        )}

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="light"
            onClick={handleCopyToClipboard}
            disabled={selectedVariables.length === 0 || isLoading}
          >
            Copy to Clipboard
          </Button>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleDownload}
            disabled={selectedVariables.length === 0 || isLoading}
            loading={isLoading}
          >
            Download File
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
