import { Info, Upload } from 'lucide-react';
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
  const [content, setContent] = useState('');

  const bulkCreateMutation = useBulkCreateEnvironmentVariables();

  const parseContent = (
    raw: string,
  ): { variables: ParsedVariable[]; errors: string[] } => {
    const variables: ParsedVariable[] = [];
    const errors: string[] = [];
    const lines = raw.split('\n').filter((line) => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#') || !line) continue;
      if (line.includes('=')) {
        const [name, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
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
          value: value.replace(/^["']|["']$/g, ''),
        });
      } else {
        errors.push(`Line ${i + 1}: Invalid format. Expected KEY=value`);
      }
    }

    return { variables, errors };
  };

  const handlePreview = () => {
    const { variables, errors } = parseContent(content);
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
    setContent('');
    setParsedVariables([]);
    setParseErrors([]);
    setImportProgress(0);
    onClose();
  };

  if (!opened) return null;

  const textareaId = 'bulk-import-textarea';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleClose();
      }}
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={handleClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative z-10 w-full max-w-2xl rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            Bulk Import Environment Variables
          </h3>
          <button
            type="button"
            className="rounded p-1 text-muted-foreground hover:bg-accent"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border bg-blue-50 p-3 text-sm text-blue-600">
            <div className="mb-1 inline-flex items-center gap-2 font-medium">
              <Info size={16} /> Instructions
            </div>
            <p>Paste your environment variables in the format:</p>
            <pre className="mt-2 rounded bg-white/70 p-2 font-mono text-xs text-blue-700">
              {`VARIABLE_NAME=value
ANOTHER_VAR="value with spaces"
# Comments are ignored`}
            </pre>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={textareaId}>
              Environment Variables
            </label>
            <textarea
              id={textareaId}
              placeholder={`DATABASE_URL=postgresql://user:pass@localhost:5432/db\nAPI_KEY=your_api_key_here\nDEBUG=true\n# This is a comment`}
              rows={10}
              className="w-full rounded-md border bg-background p-2 font-mono text-sm outline-none ring-0 focus:border-ring"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div>
              <button
                type="button"
                className="inline-flex items-center rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
                onClick={handlePreview}
                disabled={!content.trim()}
              >
                Preview
              </button>
            </div>
          </div>

          {parseErrors.length > 0 && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive-foreground">
              <p className="mb-2 font-medium">Parse Errors</p>
              <ul className="list-disc space-y-1 pl-5">
                {parseErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedVariables.length > 0 && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600">
              <p className="mb-2 font-medium">
                Found {parsedVariables.length} variables
              </p>
              <ul className="space-y-1">
                {parsedVariables.slice(0, 5).map((variable) => (
                  <li key={variable.name} className="font-mono text-xs">
                    {variable.name}={variable.value.substring(0, 20)}
                    {variable.value.length > 20 ? '...' : ''}
                  </li>
                ))}
                {parsedVariables.length > 5 && (
                  <li className="font-mono text-xs">
                    ... and {parsedVariables.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          )}

          {importProgress > 0 && importProgress < 100 && (
            <div className="h-2 w-full overflow-hidden rounded bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              className="inline-flex items-center rounded-md border bg-background px-3 py-1.5 text-sm hover:bg-accent"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow hover:opacity-90 disabled:opacity-50"
              onClick={handleImport}
              disabled={parsedVariables.length === 0 || parseErrors.length > 0}
            >
              <Upload size={16} /> Import {parsedVariables.length} Variables
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
