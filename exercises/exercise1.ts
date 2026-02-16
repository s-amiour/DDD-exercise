import { logError } from "./logger.js"

//============================================================================
// EXERCISE 1: Primitive Obsession - The Price Problem
//
// ANTI-PATTERN: Using a raw `number` for price. Nothing prevents negative
// values, absurdly large amounts, or mixing up units (see also Exercise 7).
//
// DDD FIX: Create a Value Object (or Branded Type) for Price.
// A Value Object is an immutable domain concept defined by its value, not by
// an identity. It enforces its own invariants at construction time.
//
// HINT - Branded Type approach:
//   type Price = number & { readonly __brand: unique symbol }
//   function createPrice(amount: number): Price {
//       if (amount < 0) throw new Error("Price cannot be negative")
//       if (amount > 10000) throw new Error("Price exceeds maximum")
//       return amount as Price
//   }
//
// With this pattern, `MenuItem.price` becomes `Price` instead of `number`.
// TypeScript will refuse to assign a plain number where a Price is expected,
// so every price in the system is guaranteed valid by construction.
// ============================================================================


// Define the Branded Type
type Price = number & { readonly __brand: unique symbol }

// Define the Factory function
const createPrice = (amount: number): Price => {
    // No negative numbers
    if (amount < 0) {
        throw new Error(`[Domain Error] Price cannot be negative. Received: ${amount}`)
    }
    
    // Sanity check (optional business rule)
    if (amount > 1000) {
        throw new Error(`[Domain Error] Price exceeds maximum limit. Received: ${amount}`)
    }

    // number as a Price
    return amount as Price
}

export function exercise1_PrimitivePrice() {
	// Without domain types, price is just a number
	type MenuItem = {
        name: string
        price: Price
        quantity: number
    }

    // Attempting to use the invalid data (Refactored logic)
    try {
        // error: The following line is now a Compile-Time Error!
        // const buggedItem: MenuItem = { name: "Burger", price: -50, quantity: 1 }
        
        // We must now use the factory:
        console.log("Attempting to create a burger with price -50...")
        const validPrice = createPrice(-50) // This will throw immediately

        const orderItem: MenuItem = {
            name: "Burger",
            price: validPrice,
            quantity: 1,
        }

    } catch (error: any) {
        // Catching the validation error
        console.log(`success: The system prevented the bad data!`)
        console.error(`   Error caught: "${error.message}"`)
    }

    // Valid Usage Demonstration
    try {
        const validItem: MenuItem = {
            name: "Premium Burger",
            price: createPrice(15), // Valid input
            quantity: 2
        }
        
        const total = validItem.price * validItem.quantity
        console.log(`\nCreated valid item: ${validItem.name} for $${validItem.price}`)
        console.log(`   Total calculated: $${total}`)
        
    } catch (e) {
        logError(1, "Unexpected error in valid creation", e)
    }
}
