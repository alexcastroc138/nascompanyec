import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "bundlePrice: 0\n  });",
    "bundlePrice: 0,\n    discountType: 'fixed' as 'fixed' | 'percentage'\n  });"
)

content = content.replace(
    "bundlePrice: promo.bundlePrice\n      });",
    "bundlePrice: promo.bundlePrice,\n        discountType: promo.discountType || 'fixed'\n      });"
)

content = content.replace(
    "bundlePrice: 0\n      });",
    "bundlePrice: 0,\n        discountType: 'fixed'\n      });"
)

content = content.replace(
    "bundlePrice: Number(promoFormData.bundlePrice) || 0\n      }",
    "bundlePrice: Number(promoFormData.bundlePrice) || 0,\n        discountType: promoFormData.discountType\n      }"
)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
