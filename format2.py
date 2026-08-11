import sys

with open('src/components/calendar/CalendarModule.tsx', 'r') as f:
    cal = f.read()

with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    dash = f.read()

print("```tsx\n// src/components/calendar/CalendarModule.tsx\n" + cal + "\n```\n")
print("```tsx\n// src/components/SpecialistDashboard.tsx\n" + dash + "\n```\n")
