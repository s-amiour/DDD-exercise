import { logError } from "./logger.js"

//============================================================================
// EXERCISE 4: Business Rule Violation - Table Capacity
//
// ANTI-PATTERN: Using a plain data structure (anemic type) with no
// invariant enforcement. Nothing prevents currentGuests > capacity or
// negative guest counts. The type is just a bag of numbers.
//
// DDD FIX: Use an Entity with enforced invariants.
// Unlike Value Objects (which are defined by their value), an Entity has
// a unique identity (tableNumber) and a lifecycle. Invariants (business
// rules that must ALWAYS be true) are enforced in the constructor and
// in every method that mutates state.
//
// HINT - Entity with private constructor:
//   class Table {
//       private constructor(
//           public readonly tableNumber: number,
//           public readonly capacity: number,
//           private _currentGuests: number,
//       ) {}
//
//       static create(tableNumber: number, capacity: number): Table {
//           if (capacity <= 0) throw new Error("Capacity must be positive")
//           return new Table(tableNumber, capacity, 0)
//       }
//
//       get currentGuests(): number { return this._currentGuests }
//
//       seatGuests(count: number): void {
//           if (count <= 0) throw new Error("Guest count must be positive")
//           if (this._currentGuests + count > this.capacity)
//               throw new Error("Exceeds table capacity")
//           this._currentGuests += count
//       }
//   }
//
// KEY INSIGHT: The invariant (guests <= capacity) is enforced by the Entity
// itself. External code cannot put the Entity into an invalid state because
// there is no public way to set _currentGuests directly.
// ============================================================================



class Table {
    // Private properties: External code CANNOT change these directly.
    private _currentGuests: number = 0;

    // Private Constructor: Forces users to use the 'create' factory.
    private constructor(
        public readonly tableNumber: number,
        public readonly capacity: number
    ) {}

    // Factory Method (Smart Constructor)
    // Ensures a Table starts its life in a valid state.
    static create(tableNumber: number, capacity: number): Table {
        if (capacity <= 0) {
            throw new Error(`[Domain Error] Table ${tableNumber} capacity must be positive.`);
        }
        // Note: new tables always start empty (0 guests)
        return new Table(tableNumber, capacity);
    }

    // Public Getter: Read-only access to the state
    get currentGuests(): number {
        return this._currentGuests;
    }

    // Domain Method: Changing State (Seating Guests)
    // This encapsulates the logic for "Sitting Down".
    seatGuests(count: number): void {
        if (count <= 0) {
            throw new Error("[Domain Error] Must seat at least one guest.");
        }
        
        if (this._currentGuests + count > this.capacity) {
            throw new Error(`[Domain Error] Table ${this.tableNumber} Overcapacity! Cannot seat ${count} more people. (Capacity: ${this.capacity}, Current: ${this._currentGuests})`);
        }

        this._currentGuests += count;
    }

    // Domain Method: Changing State (Leaving)
    leaveTable(): void {
        this._currentGuests = 0;
    }
}

export function exercise4_BusinessRuleViolation() {
	try {
        
        // const badTable = new Table(1, 0); // Compile Error: Constructor is private
        const badTable = Table.create(1, 0); // Runtime Error
    } catch (error: any) {
        console.log(`✅ BLOCKED: ${error.message}`);
    }

    // --- Scenario B: Valid Table, Invalid Action ---
    try {
        // Create a valid table (Capacity 4)
        const table = Table.create(5, 4);
        console.log(`Created Table ${table.tableNumber} with capacity ${table.capacity}.`);

        // Try to seat 7 people (Overcapacity)
        console.log("Attempting to seat 7 people...");
        table.seatGuests(7); 

    } catch (error: any) {
        console.log(`✅ BLOCKED: ${error.message}`);
    }

    // --- Scenario C: Valid Table, Valid Action ---
    try {
        const happyTable = Table.create(10, 6);
        
        // Seat 4 people
        happyTable.seatGuests(4);
        console.log(`\n✅ SUCCESS: Table ${happyTable.tableNumber} now has ${happyTable.currentGuests} guests.`);

        // Seat 2 more (Total 6 - Full)
        happyTable.seatGuests(2);
        console.log(`✅ SUCCESS: Table ${happyTable.tableNumber} is now full (${happyTable.currentGuests}/${happyTable.capacity}).`);

        // Try to seat 1 more (Overflow)
        // happyTable.seatGuests(1); // This would throw!

    } catch (e) {
        logError(4, "Unexpected error in valid flow", e);
    }
}
