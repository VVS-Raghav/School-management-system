import * as Yup from 'yup';

export const studentSchema = Yup.object({
    name: Yup.string()
        .required('Student name is required')
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name must not exceed 50 characters'),

    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),

    age: Yup.number()
        .required('Age is required')
        .min(3, 'Age must be at least 3')
        .max(18, 'Age must be less than 18'),

    gender: Yup.string()
        .required('Gender is required')
        .oneOf(['Male', 'Female', 'Other', 'male', 'female', 'other'], 'Invalid gender'),

    student_class: Yup.string()
        .required('Class is required'),

    guardian: Yup.string()
        .required('Guardian name is required')
        .min(3, 'Guardian name must be at least 3 characters'),

    guardian_phone: Yup.string()
        .required('Guardian phone is required')
        .matches(/^[0-9]{10}$/, 'Guardian phone must be a valid 10-digit number'),

    password: Yup.string().when('$edit', {
        is: false,
        then: (schema) => schema.required('Password is required').min(5, 'Password must be at least 5 characters long'),
        otherwise: (schema) => schema.notRequired(),
    }),

    confirm_password: Yup.string().when('$edit', {
        is: false,
        then: (schema) => schema.required('Confirm password is required').oneOf([Yup.ref('password')], 'Passwords must match'),
        otherwise: (schema) => schema.notRequired(),
    })
});
