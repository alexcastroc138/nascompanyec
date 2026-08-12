import re

with open('src/components/SpecialistDashboard.tsx', 'r') as f:
    content = f.read()

old_logic = """      const itemsInPromo = itemsToDiscount.slice(0, bundleApplications * promo.requiredQuantity);
      const regularPrice = itemsInPromo.reduce((sum, price) => sum + price, 0);
      const promoPriceTotal = bundleApplications * promo.bundlePrice;
      
      const discount = Math.max(0, regularPrice - promoPriceTotal);"""

new_logic = """      const itemsInPromo = itemsToDiscount.slice(0, bundleApplications * promo.requiredQuantity);
      const regularPrice = itemsInPromo.reduce((sum, price) => sum + price, 0);
      
      let promoPriceTotal = 0;
      if (promo.discountType === 'percentage') {
        const discountAmount = regularPrice * (promo.bundlePrice / 100);
        promoPriceTotal = regularPrice - discountAmount;
      } else {
        promoPriceTotal = bundleApplications * promo.bundlePrice;
      }
      
      const discount = Math.max(0, regularPrice - promoPriceTotal);"""

content = content.replace(old_logic, new_logic)

# Also update the UI rendering active promos
old_ui_1 = "Lleva {promo.requiredQuantity} por sólo ${promo.bundlePrice.toFixed(2)} USD"
new_ui_1 = "{promo.discountType === 'percentage' ? `Lleva ${promo.requiredQuantity} con ${promo.bundlePrice}% OFF` : `Lleva ${promo.requiredQuantity} por sólo $${promo.bundlePrice.toFixed(2)} USD`}"
content = content.replace(old_ui_1, new_ui_1)

old_ui_2 = '<span className="text-base font-black font-mono text-emerald-400">${promo.bundlePrice.toFixed(2)}</span>'
new_ui_2 = '<span className="text-base font-black font-mono text-emerald-400">{promo.discountType === \'percentage\' ? `${promo.bundlePrice}%` : `$${promo.bundlePrice.toFixed(2)}`}</span>'
content = content.replace(old_ui_2, new_ui_2)

with open('src/components/SpecialistDashboard.tsx', 'w') as f:
    f.write(content)
