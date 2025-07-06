import * as Yup from 'yup';

export const registerSchema = Yup.object({
    school_name: Yup.string()
        .required('School name is required')
        .min(5, 'School name must be at least 5 characters long')
        .max(50, 'School name must not exceed 50 characters'),
    email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    owner_name: Yup.string()
        .required('Owner name is required')
        .min(5, 'Owner name must be at least 5 characters long'),
    password: Yup.string()
        .required('Password is required')
        .min(5, 'Password must be at least 5 characters long'),
    confirm_password: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
})