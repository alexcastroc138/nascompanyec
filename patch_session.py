import re

with open('src/lib/session.ts', 'r') as f:
    content = f.read()

old_set = """export function setSessionToken(user: SessionUser, daysValid: number = 7): void {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name || '',
    avatar: user.avatar || '',
    exp: Date.now() + daysValid * 24 * 60 * 60 * 1000
  });
  const encodedPayload = encodeURIComponent(payload);
  const expires = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toUTCString();"""

new_set = """export function setSessionToken(user: SessionUser, hoursValid: number = 8): void {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name || '',
    avatar: user.avatar || '',
    exp: Date.now() + hoursValid * 60 * 60 * 1000
  });
  const encodedPayload = encodeURIComponent(payload);
  const expires = new Date(Date.now() + hoursValid * 60 * 60 * 1000).toUTCString();"""

content = content.replace(old_set, new_set)

with open('src/lib/session.ts', 'w') as f:
    f.write(content)
