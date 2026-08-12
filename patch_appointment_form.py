import re

with open('src/components/calendar/AppointmentForm.tsx', 'r') as f:
    content = f.read()

# Add currentSpecialistName to props interface
content = content.replace("  specialistsList?: string[];", "  specialistsList?: string[];\n  currentSpecialistName?: string;")
content = content.replace("  specialistsList = DEFAULT_SPECIALISTS\n}: AppointmentFormProps) {", "  specialistsList = DEFAULT_SPECIALISTS,\n  currentSpecialistName\n}: AppointmentFormProps) {")

# Update useState
content = content.replace("const [especialista, setEspecialista] = useState(initialData?.especialista || specialistsList[0] || 'Ámbar Piercing');", "const [especialista, setEspecialista] = useState(initialData?.especialista || currentSpecialistName || specialistsList[0] || 'Ámbar Piercing');")

# Update useEffect
content = content.replace("setEspecialista(initialData.especialista || specialistsList[0] || 'Ámbar Piercing');", "setEspecialista(initialData.especialista || currentSpecialistName || specialistsList[0] || 'Ámbar Piercing');")

with open('src/components/calendar/AppointmentForm.tsx', 'w') as f:
    f.write(content)

with open('src/components/calendar/CalendarModule.tsx', 'r') as f:
    mod_content = f.read()

mod_content = mod_content.replace("<AppointmentForm\n          initialData={editingAppointment || undefined}", "<AppointmentForm\n          initialData={editingAppointment || undefined}\n          currentSpecialistName={currentSpecialistName}")

with open('src/components/calendar/CalendarModule.tsx', 'w') as f:
    f.write(mod_content)

