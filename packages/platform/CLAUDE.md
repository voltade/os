# Voltade OS Platform - AI Assistant Guidelines

Concise guidelines for AI assistants working on the Voltade OS Platform to ensure consistency and quality.

## Core Rules

### 1. **Design System First**
- **ALWAYS** use `@voltade/ui` components instead of custom implementations
- **NEVER** use hardcoded colors - use semantic design tokens only
- **NEVER** create custom buttons, inputs, tables, or modals

### 2. **Required Imports**
```tsx
// ✅ CORRECT - Always use these components
import { Button } from '@voltade/ui/button.tsx';
import { Input } from '@voltade/ui/input.tsx';
import { Card, CardContent, CardHeader } from '@voltade/ui/card.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@voltade/ui/table.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@voltade/ui/dialog.tsx';

// ❌ WRONG - Never create custom implementations
<button className="bg-blue-500">Custom Button</button>
<input className="custom-styling" />
```

## Typography Standards

### Font Sizes (Use Only These)
```tsx
text-xs     // 12px - Fine print, badges
text-sm     // 14px - Body text, labels (most common)
text-base   // 16px - Reading content
text-lg     // 18px - Large body text
text-xl     // 20px - Small headers
text-2xl    // 24px - Section headers
text-3xl    // 30px - Page headers
text-5xl    // 48px - Hero text (auth pages only)

// ❌ FORBIDDEN: text-4xl, text-6xl+, text-[15px], arbitrary values
```

### Font Weights
```tsx
font-normal     // 400 - Default body text
font-medium     // 500 - Labels, emphasized text
font-semibold   // 600 - Section headers
font-bold       // 700 - Page headers only

// ❌ FORBIDDEN: font-light, font-extrabold, font-black
```

### Color Usage
```tsx
// ✅ REQUIRED - Use semantic tokens only
text-foreground           // Primary text
text-muted-foreground     // Secondary text
text-destructive          // Error/delete actions
bg-background             // Main background
bg-muted                  // Subdued backgrounds
border-border             // Default borders

// ❌ FORBIDDEN - Never use direct colors
text-gray-500, text-red-600, bg-blue-100, border-green-500
```

## Spacing Standards

### Standard Spacing Scale
```tsx
// ✅ REQUIRED - Use only these values
'1'      // 4px  - Minimal spacing
'2'      // 8px  - Standard gaps ⭐ Most common
'3'      // 12px - Comfortable spacing
'4'      // 16px - Section spacing ⭐ Forms
'6'      // 24px - Card/modal padding ⭐ Containers
'8'      // 32px - Page-level spacing

// ❌ FORBIDDEN: '5', '7', '9', '10', '11', [13px], [25px]
```

### Layout Patterns
```tsx
// ✅ Page containers
<div className="px-6 py-4 lg:px-8">Main content</div>

// ✅ Card spacing
<Card>
  <CardHeader className="p-4">Header</CardHeader>
  <CardContent className="p-6">Content</CardContent>
</Card>

// ✅ Form spacing
<form className="space-y-4">
  <div className="space-y-2">
    <label className="mb-1 block text-sm font-medium text-muted-foreground">Label</label>
    <Input />
  </div>
</form>

// ✅ Component gaps
<div className="flex items-center gap-2">  // Icon + text
<div className="space-y-6">               // Major sections
<div className="space-y-4">               // Subsections
```

## Component Patterns

### Buttons
```tsx
// ✅ CORRECT - Standard button usage
<Button variant="default">Primary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost" size="sm">
  <Edit size={16} />
  Edit
</Button>

// Action button groups
<div className="flex gap-2">
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</div>
```

### Forms
```tsx
// ✅ CORRECT - Standard form structure
<form className="space-y-4">
  <div className="space-y-2">
    <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
      Email <span className="text-destructive">*</span>
    </label>
    <Input id="email" type="email" placeholder="Enter email" />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
</form>
```

### Tables
```tsx
// ✅ CORRECT - Standard table structure
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold text-foreground">Table Title</h2>
    <Button><Plus size={16} />Add Item</Button>
  </div>
  
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead className="w-24">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>{item.name}</TableCell>
        <TableCell>
          <Button variant="ghost" size="sm">
            <Edit size={16} />
          </Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### Modals
```tsx
// ✅ CORRECT - Standard modal structure
<Dialog>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
    
    <div className="py-4">
      <p className="text-sm text-muted-foreground">Content</p>
    </div>
    
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Icons & Loading

### Icon Standards
```tsx
// ✅ CORRECT - Use Lucide React icons with standard sizes
import { Edit, Trash, Plus } from 'lucide-react';

<Edit size={16} />  // Standard UI (most common)
<Edit size={20} />  // Header/dropdown triggers
<Edit size={48} />  // Empty states only

// ❌ WRONG - Don't mix icon libraries
import { IconEdit } from '@tabler/icons-react';  // Don't mix with Lucide
```

### Loading States
```tsx
// ✅ CORRECT - Standard loading pattern
<div className="flex items-center gap-2">
  <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
  <span className="text-sm text-muted-foreground">Loading...</span>
</div>
```

### Empty States
```tsx
// ✅ CORRECT - Standard empty state
<div className="text-center p-6">
  <Inbox size={48} className="mx-auto text-muted-foreground mb-4" />
  <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
  <p className="text-sm text-muted-foreground mb-6">Description here</p>
  <Button><Plus size={16} />Create Item</Button>
</div>
```

## Common Patterns

### Auth Pages (Voltade Specific)
```tsx
// ✅ REQUIRED - Standard auth layout
<div className="flex min-h-screen">
  <div className="flex flex-1 flex-col justify-between px-6 lg:px-8">
    <div className="pt-8"><Logo /></div>
    <div className="flex flex-1 items-center">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold leading-tight text-foreground">Voltade OS</h1>
        <p className="mt-4 text-3xl leading-tight text-muted-foreground">
          Next gen business software and developer platform
        </p>
      </div>
    </div>
    <div />
  </div>
  
  <div className="flex flex-1 items-center justify-center border-l">
    <div className="w-full max-w-sm p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Form Title</h2>
        <p className="text-sm text-muted-foreground">Description</p>
      </div>
      <form className="space-y-4">{/* Form content */}</form>
    </div>
  </div>
</div>
```

### Error Handling
```tsx
// ✅ CORRECT - Use notification system
import { showError, showSuccess } from '#src/components/utils/notifications.tsx';

try {
  const result = await apiCall();
  if (result.error) {
    showError(result.error.message || 'Operation failed');
    return;
  }
  showSuccess('Operation completed successfully');
} catch (error) {
  showError(error instanceof Error ? error.message : 'An unexpected error occurred');
}
```

## Critical Don'ts

### ❌ NEVER Create Custom Implementations
```tsx
// ❌ Custom buttons
<button className="bg-violet-500 hover:bg-violet-600">Custom</button>

// ❌ Custom inputs  
<input className="w-full rounded-md border px-3 py-2" />

// ❌ Custom tables
<table className="w-full"><thead className="bg-muted/40">

// ❌ Custom modals
<div className="fixed inset-0 bg-black/50">
```

### ❌ NEVER Use Hardcoded Colors
```tsx
// ❌ Direct color classes
text-gray-500, bg-blue-100, border-red-500

// ❌ Inline styles
style={{ color: '#666' }}

// ❌ Hardcoded CSS
className="bg-violet-500"
```

### ❌ NEVER Use Arbitrary Values
```tsx
// ❌ Arbitrary spacing
px-[15px], text-[13px], gap-[25px]

// ❌ Invalid Tailwind classes
px-15, text-4xl, font-extrabold
```

## Quick Reference

**Most Common Patterns:**
- Body text: `text-sm text-foreground`
- Labels: `text-sm font-medium text-muted-foreground`  
- Headers: `text-2xl font-semibold text-foreground`
- Form spacing: `space-y-4` containers, `space-y-2` fields
- Card padding: `p-6` content, `p-4` headers
- Button groups: `flex gap-2`
- Icon + text: `flex items-center gap-2`
- Icons: Use `lucide-react` with sizes 16/20/48

**File Structure:**
- Components: `src/components/ui/`, `src/components/auth/`, `src/components/team/`
- Routes: `src/routes/` (TanStack Router file-based)
- Use `#src/` imports for internal modules
