# Development Guide: Practices

## 1. Feature-Sliced Design (FSD)

The project follows the [Feature-Sliced Design](https://feature-sliced.design/) architecture:

- Organize code into layers: features, entities, shared
- Group related components, models, and utils within feature folders
- Use slices to separate different functional parts of the application
- Implement a clear separation of concerns between UI, business logic, and data fetching

Example structure:

```
src/
  features/
    add-gauge-reward-token/
      api/
      model/
      ui/
      index.ts
  entities/
    token/
  shared/
    hooks/
    utils/
  app.tsx
```

## 2. Tanstack Query (React Query)

[Tanstack Query](https://tanstack.com/query/latest) is used for state management and data fetching:

- Use `useQuery` hooks for data fetching and caching
- Implement query keys for better cache management
- Utilize `useMutation` for data updates
- Consider using `useQueryClient` for manual cache updates

Example:

```typescript
const { data: curve } = useCurve()
```

## 3. React Hook Form

[React Hook Form](https://react-hook-form.com/) is used for form management:

- Use `useForm` hook to create form instances
- Implement form validation using schema validation (e.g., Vest)
- Utilize `Controller` component for complex form fields

## 4. Vest

[Vest](https://vestjs.dev/) is used for data validation:

- Create validation groups for each entity or form
- Use `enforce.extend` or validation functions to define individual validation rules
- Implement `enforce` for more complex validations
- Create validation groups for each important data context to enable on-the-fly data validation
- Utilize `checkValidity` and `assertValidity` functions and their derivatives to validate data

Example:

```typescript
export const poolValidationGroup = ({ chainId, poolId }: PoolQueryParams) =>
  group('poolValidation', () => {
    chainValidationGroup({ chainId })

    test('poolId', () => {
      enforce(poolId).message('Pool ID is required').isNotEmpty()
    })
  })

export const poolValidationSuite = createValidationSuite(poolValidationGroup)

const isValid = checkPoolValidity({ chainId: 1, poolId: 'example-pool' })
const validatedData = assertPoolValidity({ chainId: 1, poolId: 'example-pool' })
```

## 5. Viem

[Viem](https://viem.sh/) is used for Ethereum interactions:

- Use Viem's utility functions for address and transaction handling
- Implement custom hooks that wrap Viem functionality for easier use in components

Example:

```typescript
import { isAddress, isAddressEqual, zeroAddress, type Address } from 'viem'

// ... in validation
enforce(isAddress(data.rewardTokenId)).isTruthy()
```

## 6. BigDecimal

A custom `BigDecimal` implementation is used for precise numerical operations:

- Use `BigDecimal` for all financial calculations to avoid floating-point errors
- Implement utility functions that work with `BigDecimal` for common operations

## 7. Custom Hooks

Several custom hooks are used throughout the project:

- Create hooks for reusable logic (e.g., `useChainId`, `useCurve`)
- Implement hooks that combine multiple queries for complex data fetching scenarios

Example:

```typescript
const { data: curve } = useCurve()
```

## 8. TypeScript

The project heavily uses TypeScript:

- Define clear interfaces and types for all components and functions
- Use generics where appropriate for reusable components and functions
- Leverage TypeScript's utility types for more complex type manipulations

Remember to refer to the official documentation of each library for more detailed information and best practices.
