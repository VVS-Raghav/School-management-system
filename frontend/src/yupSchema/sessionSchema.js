import * as Yup from 'yup';

export const sessionSchema = Yup.object({
  teacher: Yup.string().required('Teacher is required'),
  subject: Yup.string().required('Subject is required'),
  date: Yup.date().required('Date is required'),
  startTime: Yup.date().required('Start time is required'),
  endTime: Yup.date().required('End time is required').test('is-after-start','End time must be after start time',
      function (value) {
        const { startTime } = this.parent;
        return value && startTime && value > startTime;
      }
    ),
});
