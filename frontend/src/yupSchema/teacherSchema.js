import * as Yup from 'yup';

export const teacherSchema = Yup.object({
  name: Yup.string()
    .required('Teacher name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must not exceed 50 characters'),

  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),

  qualification: Yup.string()
    .required('Qualification is required')
    .min(4, 'Qualification must be at least 4 characters'),

  age: Yup.number()
    .required('Age is required')
    .min(18, 'Age must be at least 18')
    .max(70, 'Age must be less than or equal to 70'),

  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['Male', 'Female', 'Other', 'male', 'female', 'other'], 'Invalid gender'),

  password: Yup.string().when('$edit', {
    is: false,
    then: (schema) =>
      schema.required('Password is required').min(5, 'Password must be at least 5 characters long'),
    otherwise: (schema) => schema.notRequired(),
  }),

  confirm_password: Yup.string().when('$edit', {
    is: false,
    then: (schema) =>
      schema.required('Confirm password is required').oneOf([Yup.ref('password')], 'Passwords must match'),
    otherwise: (schema) => schema.notRequired(),
  }),
});