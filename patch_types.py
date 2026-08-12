import re

with open('src/types.ts', 'r') as f:
    content = f.read()

# Add discountType to DynamicPromo
content = re.sub(
    r"bundlePrice: number;",
    r"bundlePrice: number;     // e.g. 10.00 USD\n  discountType?: 'fixed' | 'percentage';",
    content
)

with open('src/types.ts', 'w') as f:
    f.write(content)
