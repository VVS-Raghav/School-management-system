import * as Yup from 'yup';

export const classSchema = Yup.object({
    class_text: Yup.string().required('Class text is required'),
    class_num: Yup.string().required('Class number is required')
})