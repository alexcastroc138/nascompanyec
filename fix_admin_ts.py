import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Fix Expense 'date' to 'timestamp'
content = content.replace("e.date && e.date.startsWith(hoy)", "e.timestamp && e.timestamp.startsWith(hoy)")

# 2. Fix paymentMethod strict equality TS errors
content = content.replace("s.paymentMethod === 'cash' || s.paymentMethod === 'efectivo'", "s.paymentMethod === 'cash'")
content = content.replace("s.paymentMethod === 'transfer' || s.paymentMethod === 'transferencia'", "s.paymentMethod === 'transfer'")
content = content.replace("s.paymentMethod === 'card' || s.paymentMethod === 'tarjeta'", "s.paymentMethod === 'card'")

# 3. Add DollarSign to lucide-react imports
content = re.sub(
    r"import \{([^}]+)\} from 'lucide-react';",
    r"import {\1, DollarSign } from 'lucide-react';",
    content
)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
