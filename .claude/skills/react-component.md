# React Component Skill

Generate React + TypeScript components following project conventions.

## Usage

Invoke when user needs to create new:
- Page components
- UI components
- Form components
- Chart components

## Project Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## Component Template

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ComponentNameProps {
  // Props with proper TypeScript types
  id: string
  onAction?: () => void
}

/**
 * Component description
 * @param props - Component props
 */
export function ComponentName({ id, onAction }: ComponentNameProps) {
  const [state, setState] = useState<Type>(initialValue)

  const handleAction = () => {
    // Logic
    onAction?.()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Component JSX */}
      <Button onClick={handleAction}>
        Action
      </Button>
    </div>
  )
}
```

## Conventions

1. **Naming**: PascalCase for components
2. **Props**: Define interface with `Props` suffix
3. **Exports**: Named exports only
4. **Types**: Import `type` separately
5. **Handlers**: Prefix with `handle`
6. **State**: Descriptive names
7. **Comments**: JSDoc for exported functions
8. **Styling**: Tailwind utility classes

## File Structure

- Pages: `admin-app/src/pages/`
- Components: `admin-app/src/components/`
- Types: `admin-app/src/types/`
- API: `admin-app/src/lib/api/`

## Best Practices

- Use functional components
- Implement proper TypeScript types
- Handle loading and error states
- Add accessibility attributes
- Responsive design (mobile-first)
- Proper error boundaries
