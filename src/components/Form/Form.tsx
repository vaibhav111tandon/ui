import { useReducer } from 'react'
import { useFormik, FormikConfig } from 'formik'
import { FormContextProvider } from './FormContext'

// interface Props extends FormikProps<any>, Partial FormikConfig<any> {
interface Props
  extends Omit<FormikConfig<any>, 'validateOnMount' | 'validateOnChange'> {
  children: any
  handleIsSubmitting?: any
  handleIsValidating?: any
}

function errorReducer(state: any, action: any) {
  if (!action.error) {
    const payload = state
    delete payload[action.key]
    return payload
  }
  if (action) {
    return {
      ...state,
      [action.key]: action.error,
    }
  } else {
    throw new Error()
  }
}

export default function Form({ validate, ...props }: Props) {
  const [fieldLevelErrors, dispatchErrors] = useReducer(errorReducer, null)

  function handleFieldLevelValidation(key: any, error: string) {
    dispatchErrors({ key, error })
  }

  const formik = useFormik({
    validateOnBlur: true,
    ...props,
    validationSchema: props.validationSchema,
    initialValues: props.initialValues,
    onSubmit: props.onSubmit,
    validate:
      validate ||
      function () {
        return fieldLevelErrors
      },
  })

  // console.log('values', formik.values)
  // console.log('errors', formik.errors)
  // console.log('touched', formik.touched)

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormContextProvider
        values={formik.values}
        errors={formik.errors}
        formContextOnChange={formik.handleChange}
        handleBlur={formik.handleBlur}
        touched={formik.touched}
        fieldLevelValidation={handleFieldLevelValidation}
        // children={rest.children}
        children={props.children({
          /** map of field names to specific error for that field */
          errors: formik.errors, // errors,
          // /** map of field names to whether the field has been touched */
          touched: formik.touched,
          /** whether the form is currently submitting */
          isSubmitting: formik.isSubmitting,
          /** whether the form is currently validating (prior to submission) */
          isValidating: formik.isValidating,
          /** Number of times user tried to submit the form */
          submitCount: formik.submitCount,
        })}
      />
    </form>
  )
}
