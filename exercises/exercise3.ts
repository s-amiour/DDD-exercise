import { logError } from "./logger.js"

//============================================================================
// EXERCISE 3: String Confusion - Email vs Phone vs Name
//
// ANTI-PATTERN: Every field is `string`. TypeScript treats all strings as
// interchangeable, so you can put an email in the name field and a name in
// the email field with zero complaints. Empty strings also pass silently.
//
// DDD FIX: Use distinct Branded Types for each domain concept.
// Each type gets its own smart constructor with format-specific validation.
//
// HINT:
//   type Email = string & { readonly __brand: unique symbol }
//   type Phone = string & { readonly __brand: unique symbol }
//   type CustomerName = string & { readonly __brand: unique symbol }
//
//   function createEmail(s: string): Email {
//       if (!/^[^@]+@[^@]+\.[^@]+$/.test(s)) throw new Error("Invalid email")
//       return s as Email
//   }
//   function createPhone(s: string): Phone {
//       if (!/^\d[\d\-]{6,}$/.test(s)) throw new Error("Invalid phone")
//       return s as Phone
//   }
//   function createCustomerName(s: string): CustomerName {
//       if (s.trim().length === 0) throw new Error("Name cannot be empty")
//       return s.trim() as CustomerName
//   }
//
// Now `Customer` becomes:
//   type Customer = { name: CustomerName; email: Email; phone: Phone }
//
// Swapping fields is a COMPILE-TIME error: Email is not assignable to Phone.
// This is the core DDD idea: make illegal states unrepresentable.
// ============================================================================



// ------------------------------------------------------------------
// Branded type
// ------------------------------------------------------------------
type Email = string & { readonly __brand: unique symbol }
type Phone = string & { readonly __brand: unique symbol }
type CustomerName = string & { readonly __brand: unique symbol }

// ------------------------------------------------------------------
// Define smart constructors
// ------------------------------------------------------------------

const createEmail = (email: string): Email => {
    // Simple regex for demonstration (real email validation is harder!)
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error(`[Validation Error] Invalid email format: "${email}"`);
    }
    return email as Email;
}

const createPhone = (phone: string): Phone => {
    // allow digits and dashes, at least 7 chars
    const phoneRegex = /^\d[\d-]{6,}$/;  // different regex than prev
    if (!phoneRegex.test(phone)) {
        throw new Error(`[Validation Error] Invalid phone number: "${phone}"`);
    }
    return phone as Phone;
}

const createCustomerName = (name: string): CustomerName => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
        throw new Error("[Validation Error] Name cannot be empty.");
    }
    if (trimmed.length < 2) {
        throw new Error("[Validation Error] Name must be at least 2 characters.");
    }
    return trimmed as CustomerName;
}

export function exercise3_StringConfusion() {
	type Customer = {
        name: CustomerName;
        email: Email;
        phone: Phone;
    }

	try {
        // This will throw inside createCustomerName before the object is built
        const badName = createCustomerName(""); 
    } catch (error: any) {
        console.log(`BLOCKED: ${error.message}`);
    }

    try {
        const badEmail = createEmail("just-a-string");
    } catch (error: any) {
        console.log(`BLOCKED: ${error.message}`);
    }

    try {
        // We must manually "cast" our raw inputs through the factories
        const validCustomer: Customer = {
            name: createCustomerName("Alice Smith"),
            email: createEmail("alice@example.com"),
            phone: createPhone("555-0199"),
        };

        console.table(validCustomer);
        
    } catch (e) {
        logError(3, "Unexpected error in valid creation", e);
    }
}
