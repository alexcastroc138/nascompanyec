with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace("interface SpecialistDashboardProps {", "interface SpecialistDashboardProps {\n  users?: any[];")
content = content.replace("  currentUser,", "  currentUser,\n  users = [],")

content = content.replace("specialistsList={['Ámbar Piercing', 'Carlos Tattoo', 'Elena BodyArt', 'General Studio']}", "specialistsList={users.map(u => u.name) || ['Ámbar Piercing', 'Carlos Tattoo', 'Elena BodyArt', 'General Studio']}")

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

app_content = app_content.replace("<SpecialistDashboard\n              currentUser={specialistAmbar}", "<SpecialistDashboard\n              currentUser={specialistAmbar}\n              users={users}")

with open('src/App.tsx', 'w') as f:
    f.write(app_content)
