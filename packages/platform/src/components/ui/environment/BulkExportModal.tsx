import { Button } from '@voltade/ui/button.tsx';
import { Checkbox } from '@voltade/ui/checkbox.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@voltade/ui/dialog.tsx';
import { RadioGroup, RadioGroupItem } from '@voltade/ui/radio-group.tsx';
import { Textarea } from '@voltade/ui/textarea.tsx';
import { Download, Info } from 'lucide-react';
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
  const [format, setFormat] = useState<ExportFormat>('env');
  const [includeComments, setIncludeComments] = useState(true);

  const { data: environmentVariables = [], isLoading } =
    useEnvironmentVariablesWithSecrets(environmentId, { enabled: opened });

  useEffect(() => {
    if (environmentVariables.length > 0 && selectedVariables.length === 0) {
      setSelectedVariables(environmentVariables.map((v) => v.id));
    }
  }, [environmentVariables, selectedVariables.length]);

  const generateExportContent = (): string => {
    const selectedVars = environmentVariables.filter((v) =>
      selectedVariables.includes(v.id),
    );

    switch (format) {
      case 'env':
        return selectedVars
          .map((v) => {
            let content = '';
            if (includeComments && v.description) {
              content += `# ${v.description}\n`;
            }
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
            if (includeComments && v.description) {
              content += `# ${v.description}\n`;
            }
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
    const fileExtension = format === 'env' ? '.env' : `.${format}`;
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
    <Dialog open={opened} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Environment Variables</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Loading environment variables...
            </p>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Export Format</p>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <RadioGroupItem id="fmt-env" value="env" />
                  <label htmlFor="fmt-env">.env file format</label>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RadioGroupItem id="fmt-json" value="json" />
                  <label htmlFor="fmt-json">JSON format</label>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RadioGroupItem id="fmt-yaml" value="yaml" />
                  <label htmlFor="fmt-yaml">YAML format</label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {format !== 'json' && (
            <div className="flex items-center gap-2 text-sm">
              <Checkbox
                id="include-comments"
                checked={includeComments}
                onCheckedChange={(v) => setIncludeComments(Boolean(v))}
              />
              <label htmlFor="include-comments">
                Include descriptions as comments
              </label>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Select Variables</p>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline"
                onClick={toggleAll}
              >
                {selectedVariables.length === environmentVariables.length
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
            </div>
            <div className="max-h-56 space-y-2 overflow-auto pr-1">
              {environmentVariables.map((variable) => {
                const id = `var-${variable.id}`;
                return (
                  <div
                    key={variable.id}
                    className="flex flex-col gap-1 rounded-md p-1.5 hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={selectedVariables.includes(variable.id)}
                        onCheckedChange={() => toggleVariable(variable.id)}
                      />
                      <label htmlFor={id} className="font-mono text-sm">
                        {variable.name}
                      </label>
                    </div>
                    {variable.description && (
                      <span className="text-xs text-muted-foreground">
                        {variable.description}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedVariables.length > 0 && (
            <div className="space-y-2 rounded-md border p-3">
              <div className="flex items-center gap-2 text-sm">
                <Info size={16} />
                <span>
                  Preview of exported content ({selectedVariables.length}{' '}
                  variables):
                </span>
              </div>
              <Textarea
                value={exportContent}
                readOnly
                rows={8}
                className="font-mono text-xs"
              />
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyToClipboard}
              disabled={selectedVariables.length === 0 || isLoading}
              type="button"
            >
              Copy to Clipboard
            </Button>
            <Button
              onClick={handleDownload}
              disabled={selectedVariables.length === 0 || isLoading}
              type="button"
            >
              <Download size={16} className="mr-2" /> Download File
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
