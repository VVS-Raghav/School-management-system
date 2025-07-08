import * as Yup from 'yup';

export const subjectSchema = Yup.object({
    subject_name: Yup.string().required('Subject name is required'),
    subject_code: Yup.string().required('Subject code is required')
})