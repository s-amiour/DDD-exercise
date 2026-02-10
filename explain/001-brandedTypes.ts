/** 
 * PREVIOUS KNOWLEDGE:
1. Running code in TypeScript with Node.js
2. Basic TypeScript types (number, string, boolean, etc.)
3. Functions and type annotations
4. Type safety and compile-time checks
5. Factory functions
*/

/*  Restaurant Domain Naive Method */

const calculatePriceNaive = (price: number, quantity: number): number => {
	return price * quantity
}
// This function is very flexible but also very error-prone. It accepts any numbers !

const total = calculatePriceNaive(10, -3)  // user inputs price and quantity

console.log(`Total cost: $${total}`)  // Business logic violation; cost -30

//############################################################################################################################################################################################################################

// TODO:  1. create makePrice and makeQuantity functions that validate the inputs and return branded types instead of raw numbers.

// TODO:  2. update calculatePrice to accept only resutls from makePrice and makeQuantity, ensuring that invalid inputs are caught at compile time rather than runtime.

// TODO:  3. apply Branded Types to calculatePrice to prevent accidental misuse of the function with raw numbers, enhancing type safety in the restaurant domain.

// TODO:  4. add try-catch blocks around the calls to makePrice and makeQuantity to handle potential validation errors gracefully, ensuring that the application can respond appropriately to invalid inputs without crashing.

//############################################################################################################################################################################################################################

// Type declarations using Brand utility
type Brand<K, T> = K & { __brand: T }

type EUR = Brand<number, "EUR">
type Quantity = Brand<number, "Quantity">


/* Factory functions */
// TODO 1: validate price && Validate quantity
const makePrice = (price: number): EUR => {
	if (price < 0) 
		throw new Error("! Error: Price cannot be negative")
	return price as EUR
}

const makeQuantity = (quantity: number): Quantity => {
	if (quantity < 0) 
		throw new Error("! Error: Quantity cannot be negative")
	if (!Number.isInteger(quantity))
		throw new Error("! Error: Quantity must be a whole number")
	return quantity as Quantity
}

/* Business logic  */
// TODO 2 & 3: update calculatePrice to accept only branded types
const calculatePrice = (price: EUR, quantity: Quantity): EUR => {
    // TS allows multiplication of numbers, but we must cast the result back to EUR because (Brand * Brand) returns a raw number.
    return (price * quantity) as EUR
}

/* Restaurant price handling */
// TODO 4: try-catch blocks to handle calculating price correctly
const runRestaurantOrder = (rawPrice: number, rawQty: number): EUR | undefined => {
	console.log(`-- Attempting order: Price ${rawPrice}, Quantity ${rawQty} --`)

	try {
		// first, validate inputs
		const validPrice = makePrice(rawPrice)
		const validQuantity = makeQuantity(rawQty)

		// calculate price
		const bill = calculatePrice(validPrice, validQuantity)
		// NOTE TO SELF: `const bill = calculatePrice(10, 5)` or `const bill = calculatePrice(rawPrice, rawQty)` WILL CAUSE AN ERROR !
		
		console.log(`Calculated Bill: ${bill} EUR. Prepare check-out.`)

		return bill as EUR
	} catch (error) {
		if (error instanceof Error){
			console.error(`Transaction Failed: ${error.message}`)
		} else {
			console.error(`An unknown error occurred`)
		}
	}
}



// DUMP

// // Define the Brand utility
// type Brand<K, T> = K & { __brand: T }

// // Domain-specific types
// type USD = Brand<number, "USD">
// type Quantity= Brand<number, "Quantity">

// /*    TYPES   */
// const calculatePrice = (price: USD, quantity: Quantity): USD => {
// 	return (price * quantity) as USD
// }

/* RESTAURANT DOMAIN  */
/*   user orders 3 pizzas for $10  */

// const total = calculatePrice(45651321, -3)

// const makePrice = (value: number): USD => {
// 	if (value < 0) throw new Error("Price cannot be negative")
// 	if (value > 1000)
// 		throw new Error("Price seems suspiciously high for a pizza!")
// 	return value as USD
// }

// const makeQuantity = (value: number): Quantity => {
// 	if (value <= 0) throw new Error("Quantity must be positive")
// 	if (!Number.isInteger(value))
// 		throw new Error("Quantity must be a whole number")
// 	return value as Quantity
// }

// try {
// 	// These validators ensure the numbers make sense before the function ever runs
// 	const pizzaPrice = makePrice(-10)
// 	const pizzaCount = makeQuantity(3)

// 	const total = calculatePrice(pizzaPrice, pizzaCount)
// 	console.log(`Total is $${total}`) // Total is $30

// try {

// 	const total = calculatePrice(456 as USD, 4856 as Quantity)  // Interpreter reads it as: const total = calculatePrice(456, 4856)

// 	console.log(total)
// } catch (e: unknown) {
// 	console.error(e instanceof Error ? e.message : "An unknown error occurred")
// }
