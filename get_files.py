import sys

with open('src/types.ts', 'r', encoding='utf-8') as f:
    types = f.read()

with open('src/components/SpecialistDashboard.tsx', 'r', encoding='utf-8') as f:
    dash = f.read()

print("```typescript\n// src/types.ts\n" + types + "```\n")
print("```tsx\n// src/components/SpecialistDashboard.tsx\n" + dash + "```\n")
