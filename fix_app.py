with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("newSale.paymentMethod === 'efectivo'", "(newSale.paymentMethod as string) === 'efectivo'")

with open('src/App.tsx', 'w') as f:
    f.write(content)
