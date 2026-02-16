import { logError } from "./logger.js"

//============================================================================
// EXERCISE 5: The Identity Crisis - Order IDs
//
// ANTI-PATTERN: Using a plain `string` for an identifier. Nothing enforces
// format, non-emptiness, or uniqueness. Duplicate and empty IDs slip through.
//
// DDD FIX: Model identity as a dedicated Value Object with a controlled
// creation strategy. In DDD, the identity of an Entity is a first-class
// concept -- it deserves its own type.
//
// HINT - Branded type + factory:
//   type OrderId = string & { readonly __brand: unique symbol }
//
//   // Option A: Enforce a format (e.g., "ORD-" prefix + numeric)
//   function createOrderId(raw: string): OrderId {
//       if (!/^ORD-\d{5,}$/.test(raw))
//           throw new Error("OrderId must match ORD-XXXXX format")
//       return raw as OrderId
//   }
//
//   // Option B: Generate guaranteed-unique IDs (UUID-based)
//   function generateOrderId(): OrderId {
//       return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` as OrderId
//   }
//
// For uniqueness across a collection, use a Repository pattern: the
// Repository is responsible for ensuring no two Entities share an ID.
// This separates identity validation (Value Object) from uniqueness
// enforcement (Repository).
// ============================================================================


type OrderId = string & { readonly __brand: unique symbol }

// Factory: Enforce Format (ORD-XXXXX)
const createOrderId = (id: string): OrderId => {
    // Regex: Starts with "ORD-", followed by at least 5 digits
    const idRegex = /^ORD-\d{5,}$/;
    
    if (!idRegex.test(id)) {
        throw new Error(`[Format Error] OrderId "${id}" must match pattern ORD-XXXXX.`);
    }
    
    return id as OrderId;
}

// Generator: Create a new valid ID (for new orders)
const generateOrderId = (): OrderId => {
    const timestamp = Date.now().toString().slice(-5);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}${random}` as OrderId;
}

// -------------------------------------------------------------
type Order = {
    orderId: OrderId; // Now strongly typed!
    customerName: string;
    total: number;
}

class OrderRepository {
    // Simulating a database with a Map
    private storage = new Map<string, Order>();

    save(order: Order): void {
        // Uniqueness Check happens HERE, not in the ID itself.
        if (this.storage.has(order.orderId)) {
            throw new Error(`[Duplicate Error] Order ID ${order.orderId} already exists!`);
        }
        
        this.storage.set(order.orderId, order);
        console.log(`Saved Order: ${order.orderId} for ${order.customerName}`);
    }
}

export function exercise5_IdentityCrisis() {
	const repository = new OrderRepository();

    try {
        console.log("Attempting to create order with empty ID...");
        // const badId = createOrderId(""); // Throws immediately
        
        const order: Order = {
            orderId: createOrderId("bad-format"), // Throws immediately
            customerName: "Alice",
            total: 25
        };
    } catch (error: any) {
        console.log(`BLOCKED (Format): ${error.message}`);
    }

    try {
        const sharedId = createOrderId("ORD-99999");

        const order1: Order = { orderId: sharedId, customerName: "Bob", total: 30 };
        const order2: Order = { orderId: sharedId, customerName: "Charlie", total: 15 };

        // Save first order -> Success
        repository.save(order1);

        // Save second order -> Fail (Duplicate)
        console.log("Attempting to save duplicate ID...");
        repository.save(order2);

    } catch (error: any) {
        console.log(`BLOCKED (Unique): ${error.message}`);
    }

    try {
        const newId = generateOrderId(); // e.g., "ORD-12345..."
        const validOrder: Order = {
            orderId: newId,
            customerName: "Diana",
            total: 100
        };
        repository.save(validOrder);
        
    } catch (e) {
        logError(5, "Unexpected error", e);
    }
}
