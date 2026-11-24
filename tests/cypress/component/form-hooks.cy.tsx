import type { MountReturn } from 'cypress/react'
import { type ComponentProps, useLayoutEffect } from 'react'
import { test } from 'vest'
import { useFormValidation, type ValidatedForm } from '@ui/features/forms/useFormValidation'
import { useFormValues } from '@ui/features/forms/useFormValues'
import { constQ, q, type QueryProp } from '@ui/features/queries/util'
import { Duration } from '@ui/features/themes/design/0_primitives'
import { enforce } from '@ui/lib/validation/enforce-extension'
import { createValidationSuite } from '@ui/lib/validation/lib'

type Values = { amount: number }
type Form = ValidatedForm<Values, object, { maxAmount: number }>
const createSuite = () =>
  createValidationSuite<Values & { maxAmount: number }>(({ amount, maxAmount }) => {
    test('root', 'Enter a positive amount', () => {
      enforce(amount).greaterThan(0)
    })
    test('maxAmount', 'Amount exceeds maximum', () => {
      enforce(amount).lessThanOrEquals(maxAmount)
    })
  })

function FormProbe({
  validation,
  onChange,
  maxAmount = constQ(10),
}: {
  validation: ReturnType<typeof createSuite>
  onChange: (form: Form) => void
  maxAmount?: QueryProp<number>
}) {
  const inputs = useFormValues({ defaultValues: { amount: 1 }, context: {} })
  const form = useFormValidation({ inputs, validation, computed: { maxAmount }, isSubmitting: false })
  useLayoutEffect(() => onChange(form), [form, onChange])
  return null
}

/**
 * Test the form hooks after the React Compiler: removing manual memoization must preserve callback stability,
 * while Vest's opt-out must preserve its state between renders.
 **/
describe('form hooks with React Compiler', () => {
  let form: Form
  let validation: ReturnType<typeof createSuite>
  const onChange = (value: Form) => {
    form = value
  }
  const rerender = (props: Partial<ComponentProps<typeof FormProbe>>) =>
    cy
      .get<MountReturn>('@mounted')
      .then(({ rerender }) => rerender(<FormProbe validation={validation} onChange={onChange} {...props} />))

  beforeEach(() => {
    cy.clock()
    validation = createSuite()
    cy.spy(validation, 'reset').as('reset')
    cy.mount(<FormProbe validation={validation} onChange={onChange} />).as('mounted')
    cy.get('@reset').should('have.been.calledOnce')
  })

  it('keeps callbacks stable and tracks user edits without manual memoization', () => {
    let previous: Form
    cy.then(() => {
      previous = form
      form.update({ amount: 3 }, { mode: 'automatic' })
    })
    cy.wrap(null).should(() => {
      expect(form.values.amount).to.equal(3)
      expect(form.isTouched('amount')).to.equal(false)
      expect(form.formState.isDirty).to.equal(false)
    })
    cy.then(() => form.update({ amount: 2 }, { mode: 'immediate' }))
    cy.wrap(null).should(() => {
      expect(form.values.amount).to.equal(2)
      expect(form.isTouched('amount')).to.equal(true)
      expect(form.formState.isDirty).to.equal(true)
      expect(form.update).to.equal(previous.update)
      expect(form.reset).to.equal(previous.reset)
    })
    cy.then(() => form.update({ amount: 1 }, { mode: 'immediate' }))
    cy.wrap(null).should(() => {
      expect(form.params.amount).to.equal(1)
      expect(form.isTouched('amount')).to.equal(true)
      expect(form.formState.isDirty).to.equal(false)
    })
    cy.then(() => form.reset())
    cy.wrap(null).should(() => {
      expect(form.formState.touchedFields).to.deep.equal({})
    })
  })

  it('validates all fields when the selection is empty', () => {
    expect(createSuite().run({ amount: 20, maxAmount: 10 }, []).getErrors()).to.deep.equal({
      maxAmount: ['Amount exceeds maximum'],
    })
  })

  it('shows root errors after editing and clears them as inputs change', () => {
    cy.then(() => form.update({ amount: 0 }, { mode: 'automatic' }))
    cy.wrap(null).should(() => {
      expect(form.formState.errors.root?.message).to.equal('Enter a positive amount')
      expect(form.formState.isValid).to.equal(false)
      expect(form.formState.visibleErrors).to.deep.equal([])
    })

    cy.then(() => form.update({ amount: -1 }, { mode: 'immediate' }))
    cy.wrap(null).should(() =>
      expect(form.formState.visibleErrors).to.deep.equal([['root', 'Enter a positive amount']]),
    )

    cy.then(() => form.update({ amount: 2 }))
    cy.wrap(null).should(() => {
      expect(form.formState.errors.root).to.equal(undefined)
      expect(form.formState.visibleErrors).to.deep.equal([])
      expect(form.formState.isValid).to.equal(true)
    })
  })

  it('shows computed errors before editing and hides retained errors while data is missing', () => {
    rerender({ maxAmount: constQ(0) })
    cy.wrap(null).should(() => {
      expect(form.formState.isDirty).to.equal(false)
      expect(form.formState.visibleErrors).to.deep.equal([['maxAmount', 'Amount exceeds maximum']])
    })

    rerender({ maxAmount: q({ data: undefined, isLoading: true, error: null }) })
    cy.wrap(null).should(() => {
      expect(form.formState.errors.maxAmount?.message).to.equal('Amount exceeds maximum')
      expect(form.formState.visibleErrors).to.deep.equal([])
    })

    rerender({ maxAmount: constQ(10) })
    cy.wrap(null).should(() => expect(form.formState.errors).to.deep.equal({}))
  })

  it('keeps the previous limit error while debouncing, but validates the latest value for submission', () => {
    const onSubmit = cy.stub().as('submit')
    cy.then(() => form.update({ amount: 20 }, { mode: 'immediate' }))
    cy.wrap(null).should(() => {
      expect(form.formState.visibleErrors).to.deep.equal([['maxAmount', 'Amount exceeds maximum']])
      expect(form.formState.isValid).to.equal(false)
    })
    cy.then(() => form.update({ amount: 2 }))
    cy.wrap(null).should(() => {
      // The latest value is valid, but its deferred limit error must survive the full validity check.
      expect(form.formState.visibleErrors).to.deep.equal([['maxAmount', 'Amount exceeds maximum']])
      expect(validation.get().hasErrors('maxAmount')).to.equal(true)
      expect(form.formState.isValid).to.equal(true)
      expect(form.isDisabled).to.equal(true)
    })
    cy.then(() => form.handleSubmit(onSubmit)())
    cy.get('@submit').should('not.have.been.called')
    cy.tick(Duration.FormDebounce)
    cy.wrap(null).should(() => expect(form.isDebouncing).to.equal(false))
    cy.then(() => {
      expect(form.formState.errors).to.deep.equal({})
      expect(form.isDisabled).to.equal(false)
      return form.handleSubmit(onSubmit)()
    })
    cy.get('@submit').should('have.been.calledOnceWith', { amount: 2, maxAmount: 10 })
  })

  it('resets only for an explicit reset or a replacement suite', () => {
    // Regression: the compiler previously moved validation.reset() outside useMemo's dependency check.
    cy.then(() => form.update({ amount: 3 }, { mode: 'automatic' }))
    cy.wrap(null).should(() => expect(form.values.amount).to.equal(3))
    cy.get('@reset').should('have.been.calledOnce')
    cy.then(() => form.reset())
    cy.get('@reset').should('have.been.calledTwice')
    // Reset must also run when the values already equal their defaults.
    cy.then(() => form.reset())
    cy.get('@reset').should('have.been.calledThrice')

    const replacement = createSuite()
    cy.spy(replacement, 'reset').as('replacementReset')
    rerender({ validation: replacement })
    cy.get('@replacementReset').should('have.been.calledOnce')
  })
})
