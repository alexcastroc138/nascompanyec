import sys

with open('src/components/calendar/CalendarModule.tsx', 'r') as f:
    cal = f.read()

with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    dash = f.read()

print("```tsx")
print("// src/components/calendar/CalendarModule.tsx")
print(cal)
print("```")
print("")
print("```tsx")
print("// src/components/SpecialistDashboard.tsx")
print(dash)
print("```")
