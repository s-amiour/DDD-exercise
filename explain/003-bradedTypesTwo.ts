/*  USER REGISTRATION   */


// Type declaration
// NOTE: Type declarations whose JS translated form is not existant
type naiveUser = {
	name: any
	email: string
	phone: string
	password: string
}

const naiveCreateUser = (name: any, email: string, phone: string, password: string): naiveUser => {
	return {
		name,
		email,
		phone,
		password,
	}
}
// CAREFUL ! This function is very flexible but also very error-prone. It accepts any strings !

/*  manual tests   */
const newNaiveUser = naiveCreateUser(
	true,  // type violation
	"alice@example.com",
	"secret123",  // business logic violation
	"123-456-7890",  // business logic violation
)

console.table(newNaiveUser)

//############################################################################################################################################################################################################################

// TODO: 1. Type checks

// TODO: 2. Validation checks (Factory Functions) return Phone Type with a simple string (weak validation)

// TODO: 3. try-catch blocks around the calls to createPhone to handle potential validation errors gracefully, ensuring that the application can respond appropriately to invalid inputs without crashing.

// TODO: 4. Branded Types to prevent accidental misuse of the createUser function with raw strings, enhancing type safety in the restaurant domain.

//############################################################################################################################################################################################################################
/*

-----   Factory Functions  -----
const makeName()
const makeEmail()
const makePhone()
const makePassword()

*/

// Validation Rules for createUser:
// - name: Must be a non-empty string, typically 2-50 characters, no special characters except spaces/hyphens
// - email: Must follow valid email format (local@domain.tld), cannot be empty
// - phone: Already validated by createPhone factory (French format: 10 digits, valid prefix)
// - socialSecurityNumber: Must follow a specific format (depends on country - length, structure, checksum)
//   * Could be validated as a Value Object similar to Phone
//   * Should not be stored as plain string in production (PII/security concern)
// - All fields: Should check for null/undefined
// - Business rule: User must have unique email (typically checked against database)

// Branded Types:
// - Name: string & { readonly __brand: unique symbol }
// - Email: string & { readonly __brand: unique symbol }
// - Phone: string & { readonly __brand: unique symbol }
// - Password: string & { readonly __brand: unique symbol }
// - SocialSecurityNumber: string & { readonly __brand: unique symbol }

//############################################################################################################################################################################################################################

// SOLUTION

// ------------------------------------------------------------------
// Branded Types
// ------------------------------------------------------------------
// This helper creates a "Brand" to make a string unique at the type level.
// It prevents a raw 'string' from being passed where a 'Email' is expected.
type Branded<K, T> = K & { readonly __brand: T };

export type Name = Branded<string, 'Name'>;
export type Email = Branded<string, 'Email'>;
export type Phone = Branded<string, 'Phone'>;
export type Password = Branded<string, 'Password'>;

// ------------------------------------------------------------------
// 2. FACTORY FUNCTIONS (Validation Logic)
// ------------------------------------------------------------------

/**
 * Validates and creates a Name.
 * Rules: Non-empty, 2-50 chars, no special symbols (except space/hyphen).
 */
const makeName = (input: unknown): Name => {
    // Type Check (Runtime)
    if (typeof input !== 'string') {
        throw new Error(`[ValidationError] Name must be a string. Received: ${typeof input}`);
    }
    const trimmed = input.trim();

    // Business Logic Checks
    if (trimmed.length < 2 || trimmed.length > 50) {
        throw new Error("[ValidationError] Name must be between 2 and 50 characters.");
    }

    const nameRegex = /^[a-zA-Z\s-]+$/;
    if (!nameRegex.test(trimmed)) {
        throw new Error("[ValidationError] Name contains invalid characters.");
    }

    // Return as Branded Type
    return trimmed as Name;
};

/**
 * Validates and creates an Email.
 * Rules: Standard Email regex.
 */
const makeEmail = (input: unknown): Email => {
    if (typeof input !== 'string') {
        throw new Error(`[ValidationError] Email must be a string.`);
    }
    const trimmed = input.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
        throw new Error("[ValidationError] Invalid email format.");
    }

    return trimmed as Email;
};

/**
 * Validates and creates a Phone.
 * Rules: French format (10 digits, starts with 0).
 */
const makePhone = (input: unknown): Phone => {
    if (typeof input !== 'string') {
        throw new Error(`[ValidationError] Phone must be a string.`);
    }
    
    // Remove spaces, dots, dashes for pure digit validation
    const sanitized = input.replace(/[\s.-]/g, '');

    // French Validation: Starts with 0, followed by 1-9, then 8 digits
    const phoneRegex = /^0[1-9]\d{8}$/; 
    
    if (!phoneRegex.test(sanitized)) {
        throw new Error("[ValidationError] Invalid French phone number format (e.g., 0612345678).");
    }

    return sanitized as Phone;
};

/**
 * Validates and creates a Password.
 * Rules: Min 8 chars.
 */
const makePassword = (input: unknown): Password => {
    if (typeof input !== 'string') {
        throw new Error(`[ValidationError] Password must be a string.`);
    }
    
    if (input.length < 8) {
        throw new Error("[ValidationError] Password must be at least 8 characters long.");
    }

    return input as Password;
};

// ------------------------------------------------------------------
// 3. MAIN DOMAIN FUNCTION
// ------------------------------------------------------------------

type User = {
    name: Name;
    email: Email;
    phone: Phone;
    password: Password;
};

// NOTE: We no longer accept 'string'. We accept only Validated Types.
// It is now impossible to pass a raw string or the wrong type here.
const createUser = (name: Name, email: Email, phone: Phone, password: Password): User => {
    return {
        name,
        email,
        phone,
        password,
    };
};

// ------------------------------------------------------------------
// 4. EXECUTION (Try-Catch Block)
// ------------------------------------------------------------------

const runRegistration = () => {
    console.log("--- Attempting User Registration ---");

    try {
        // Step A: Create Validated Value Objects
        // If any of these fail, execution stops and jumps to catch block.
        const userName = makeName("Alice Wonderland");
        const userEmail = makeEmail("alice@example.com");
        const userPhone = makePhone("0612345678"); // Valid French Mobile
        const userPass = makePassword("SuperSecret123!");

        // Step B: Create the User Entity
        // This is now type-safe. You cannot swap email and phone.
        const newUser = createUser(
            userName, 
            userEmail, 
            userPhone, 
            userPass
        );

        console.log("✅ Success! User created:");
        console.table(newUser);

    } catch (error) {
        // Step C: Graceful Error Handling
        if (error instanceof Error) {
            console.error(`❌ Registration Failed: ${error.message}`);
        } else {
            console.error("❌ An unexpected error occurred.");
        }
    }
};

// --- Test Case 1: Valid Data ---
runRegistration();

// --- Test Case 2: Invalid Data (Uncomment to test) ---
/*
try {
    const badPhone = makePhone("not-a-number"); // Will throw immediately
} catch (e: any) {
    console.log(`\n(Test 2 Result) Caught expected error: ${e.message}`);
}
*/