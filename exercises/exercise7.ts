import { logError } from "./logger.js"

//============================================================================
// EXERCISE 7: Currency Confusion
//
// ANTI-PATTERN: Using a raw `number` for money without specifying the unit.
// Is 1850 dollars or cents? When two developers use different conventions,
// adding their values produces nonsense.
//
// DDD FIX: Create a Money Value Object that pairs amount with currency/unit.
// In DDD, a Value Object is defined by its attributes and has no identity.
// Money is a textbook example -- $10 is $10 regardless of which bill it is.
//
// HINT - Money Value Object:
//   type Currency = "USD" | "EUR" | "GBP"
//
//   class Money {
//       private constructor(
//           private readonly cents: number, // always stored in smallest unit
//           public readonly currency: Currency,
//       ) {}
//
//       static fromDollars(amount: number, currency: Currency): Money {
//           return new Money(Math.round(amount * 100), currency)
//       }
//       static fromCents(cents: number, currency: Currency): Money {
//           if (!Number.isInteger(cents)) throw new Error("Cents must be integer")
//           return new Money(cents, currency)
//       }
//
//       add(other: Money): Money {
//           if (this.currency !== other.currency)
//               throw new Error("Cannot add different currencies")
//           return new Money(this.cents + other.cents, this.currency)
//       }
//
//       format(): string {
//           return `$${(this.cents / 100).toFixed(2)}`
//       }
//   }
//
// KEY INSIGHT: By storing everything in cents (smallest unit), you avoid
// floating-point issues. The type system prevents mixing currencies, and
// the single representation eliminates dollars-vs-cents ambiguity.
// ============================================================================



type Currency = "USD" | "EUR" | "GBP";

class Money {
    // Private: We store money as INTEGER CENTS to avoid floating point errors.
    private constructor(
        private readonly cents: number, 
        public readonly currency: Currency
    ) {}

    // Factory A: Create from "Human Readable" Dollars (e.g., 12.50)
    static fromDollars(amount: number, currency: Currency): Money {
        // Round to nearest cent to handle floating point inputs like 12.49999
        const cents = Math.round(amount * 100);
        return new Money(cents, currency);
    }

    // Factory B: Create from "Machine Readable" Cents (e.g., 1250)
    static fromCents(amount: number, currency: Currency): Money {
        if (!Number.isInteger(amount)) {
            throw new Error(`[Money Error] Cents must be an integer. Received: ${amount}`);
        }
        return new Money(amount, currency);
    }

    // Domain Operation: Safe Addition
    add(other: Money): Money {
        if (this.currency !== other.currency) {
            throw new Error(`[Money Error] Cannot add ${this.currency} to ${other.currency}.`);
        }
        return new Money(this.cents + other.cents, this.currency);
    }

    // Domain Operation: Formatting
    toString(): string {
        // Divide by 100 to display, ensure 2 decimal places
        const displayAmount = (this.cents / 100).toFixed(2);
        return `${this.currency} ${displayAmount}`;
    }
}

export function exercise7_CurrencyConfusion() {
	type MenuItem = {
        name: string;
        price: Money;
    }

    // Developer 1 thinks in "Dollars"
    const burger: MenuItem = {
        name: "Burger",
        price: Money.fromDollars(12.50, "USD"), // Explicit!
    }

    // Developer 2 thinks in "Cents" (maybe from a Stripe API)
    const pizza: MenuItem = {
        name: "Pizza",
        price: Money.fromCents(1850, "USD"), // Explicit! ($18.50)
    }

    try {
        console.log(`Burger: ${burger.price.toString()}`);
        console.log(`Pizza:  ${pizza.price.toString()}`);

        // We are adding Money objects, not raw numbers.
        const total = burger.price.add(pizza.price);

        console.log(`\nTotal Bill: ${total.toString()}`);
        
    } catch (e: any) {
        logError(7, "Calculation failed", e);
    }

    try {
        const euroSalad = Money.fromDollars(10, "EUR");
        console.log("\nAttempting to add EUR salad to USD burger...");
        
        // This throws a helpful error instead of calculating nonsense
        burger.price.add(euroSalad); 

    } catch (error: any) {
        console.log(`BLOCKED: ${error.message}`);
    }
}
