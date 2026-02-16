import { logError } from "./logger.js"

//============================================================================
// EXERCISE 8: The Email Validation Gap
//
// ANTI-PATTERN: Using `string` for email. TypeScript's type system cannot
// distinguish "alice@example.com" from "not-an-email" -- they're both strings.
// Every invalid format silently passes through.
//
// DDD FIX: Apply the "Parse, Don't Validate" principle.
// Instead of validating a string and hoping callers remember to check,
// parse it into a domain type. Once you have an `Email`, it is guaranteed
// valid -- no further checking needed anywhere in the codebase.
//
// HINT:
//   type Email = string & { readonly __brand: unique symbol }
//
//   function parseEmail(raw: string): Email {
//       const trimmed = raw.trim()
//       if (trimmed.length === 0) throw new Error("Email cannot be empty")
//       // Basic structural check: local@domain.tld
//       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
//           throw new Error(`Invalid email format: "${raw}"`)
//       return trimmed.toLowerCase() as Email
//   }
//
// KEY INSIGHT - "Parse, Don't Validate":
//   - Validation checks a value and returns boolean -> caller can ignore it.
//   - Parsing converts raw input into a strong type or throws -> impossible
//     to have an invalid Email in the system.
//   - This is a core DDD principle: push validation to the boundary of
//     your system (user input, API responses) and work with guaranteed-valid
//     types everywhere else.
// ============================================================================



type Email = string & { readonly __brand: unique symbol }

const parseEmail = (raw: string): Email => {
    // Sanitize (Trim whitespace)
    const trimmed = raw.trim();

    // Check existence
    if (trimmed.length === 0) {
        throw new Error("[Email Error] Email cannot be empty.");
    }

    // Validate Format (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
        throw new Error(`[Email Error] Invalid format: "${raw}"`);
    }

    // Normalize (Store as lowercase)
    return trimmed.toLowerCase() as Email;
}

export function exercise8_EmailValidation() {
	type Customer = {
        name: string
        email: Email
    }

    // Raw input from an "API" or "Form" (Untrusted Data)
    const rawInputs = [
        { name: "Alice", rawEmail: "Alice@Example.com" },   // Valid (Mixed case)
        { name: "Bob", rawEmail: "not-an-email" },          // Invalid
        { name: "Charlie", rawEmail: "charlie@@double.com" }, // Invalid
        { name: "Diana", rawEmail: "@no-local-part.com" },  // Invalid
        { name: "Eve", rawEmail: "eve@" },                  // Invalid
        { name: "Frank", rawEmail: "   " },                 // Invalid (Whitespace)
    ];

    console.log(`Processing ${rawInputs.length} incoming records...`);

    // We only create a 'Customer' if the email parses successfully.
    const validCustomers: Customer[] = [];

    rawInputs.forEach(input => {
        try {
            // We attempt to "Parse" the string into an Email type.
            const parsedEmail = parseEmail(input.rawEmail);

            // If we get here, the email is guaranteed valid.
            const customer: Customer = {
                name: input.name,
                email: parsedEmail
            };

            validCustomers.push(customer);
            console.log(`[Success] Created customer: ${customer.name} (${customer.email})`);

        } catch (error: any) {
            // If parsing fails, the bad data never enters our domain model.
            console.log(`[Rejected] ${input.name}: ${error.message}`);
        }
    });

    console.log(`\nFinal valid customer count: ${validCustomers.length}`);
}
