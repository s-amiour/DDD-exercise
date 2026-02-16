import { logError } from "./logger.js"

//============================================================================
// EXERCISE 6: Temporal Logic Error - Operating Hours
//
// ANTI-PATTERN: Representing domain-specific time concepts as raw numbers.
// Two problems: (1) invalid values (25, -5) are accepted, and (2) the
// business logic for "is the restaurant open?" is wrong for overnight spans.
//
// DDD FIX: Encapsulate the concept of "operating hours" in a Value Object
// that owns its own validation AND its own logic.
//
// HINT - Value Object with behavior:
//   type Hour = number & { readonly __brand: unique symbol }
//   function createHour(h: number): Hour {
//       if (!Number.isInteger(h) || h < 0 || h > 23)
//           throw new Error("Hour must be 0-23")
//       return h as Hour
//   }
//
//   class OperatingHours {
//       private constructor(
//           public readonly opens: Hour,
//           public readonly closes: Hour,
//       ) {}
//
//       static create(opens: number, closes: number): OperatingHours {
//           return new OperatingHours(createHour(opens), createHour(closes))
//       }
//
//       isOpenAt(hour: Hour): boolean {
//           // Handles midnight crossover correctly
//           if (this.opens <= this.closes) {
//               return hour >= this.opens && hour < this.closes
//           }
//           return hour >= this.opens || hour < this.closes
//       }
//   }
//
// KEY INSIGHT: In DDD, domain logic lives inside the domain objects, not in
// external utility functions. OperatingHours knows how to answer "am I open?"
// because that question is part of its domain responsibility.
// ============================================================================


type Hour = number & { readonly __brand: unique symbol }

// Factory: Ensures 0-23 range
const createHour = (h: number): Hour => {
    if (!Number.isInteger(h)) {
        throw new Error(`[Time Error] Hour must be an integer. Received: ${h}`)
    }
    if (h < 0 || h > 23) {
        throw new Error(`[Time Error] Hour must be between 0 and 23. Received: ${h}`)
    }
    return h as Hour
}

// ------------------------------------------------------------------
// 2. DEFINE THE 'OPERATING HOURS' VALUE OBJECT
// ------------------------------------------------------------------
class OperatingHours {
    // Private properties: Immutable once created
    private constructor(
        public readonly opens: Hour,
        public readonly closes: Hour
    ) {}

    // Factory: Creates the object safely
    static create(opensStr: number, closesStr: number): OperatingHours {
        return new OperatingHours(
            createHour(opensStr), 
            createHour(closesStr)
        )
    }

    // Domain Logic: "Are we open?"
    // This logic now lives HERE, not scattered in your UI code.
    isOpenAt(current: number): boolean {
        // Validate the input first
        const checkHour = createHour(current);

        // Scenario A: Standard Day (e.g., 09:00 to 17:00)
        if (this.opens < this.closes) {
            return checkHour >= this.opens && checkHour < this.closes;
        } 
        
        // Scenario B: Overnight (e.g., 22:00 to 06:00)
        // We are open if it is AFTER opening time OR BEFORE closing time.
        // (e.g., Is 23:00 open? Yes (>= 22). Is 02:00 open? Yes (< 06).)
        else {
            return checkHour >= this.opens || checkHour < this.closes;
        }
    }
    
    // Helper for display
    toString(): string {
        return `${this.opens}:00 - ${this.closes}:00`;
    }
}

export function exercise6_TemporalLogic() {
	type Restaurant = {
        name: string;
        hours: OperatingHours;
    }

    // --- Scenario A: Valid Overnight Restaurant ---
    try {
        const joesDiner: Restaurant = {
            name: "Joe's Diner",
            hours: OperatingHours.create(22, 6) // Open 10 PM to 6 AM
        };

        console.log(`Checking ${joesDiner.name} (${joesDiner.hours.toString()})...`);

        // Test 1: Check 2 AM (Should be OPEN)
        const checkTime1 = 2;
        const result1 = joesDiner.hours.isOpenAt(checkTime1);
        console.log(`   Is open at ${checkTime1}:00? ${result1 ? "✅ YES" : "❌ NO"}`);

        // Test 2: Check 11 AM (Should be CLOSED)
        const checkTime2 = 11;
        const result2 = joesDiner.hours.isOpenAt(checkTime2);
        console.log(`   Is open at ${checkTime2}:00? ${result2 ? "❌ YES" : "✅ NO"}`);

    } catch (e: any) {
        logError(6, "Unexpected error", e);
    }

    // --- Scenario B: Invalid Data Prevention ---
    try {
        console.log("\nAttempting to create invalid hours (25:00)...");
        // This throws immediately
        const brokenHours = OperatingHours.create(25, -5); 
    } catch (error: any) {
        console.log(`✅ BLOCKED: ${error.message}`);
    }
}
