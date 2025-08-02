import Fee from '../models/fee.model.js';
import FeeTemplate from '../models/feetemplate.model.js';
import Student from '../models/student.model.js';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getAllFees = async (req, res) => {
  try {
    const filter = {};
    if (req.query.class) filter.classId = req.query.class;

    const fees = await Fee.find(filter).populate('student', 'name email').populate({path: 'template',populate: { path: 'classId' },})
                                                                         .sort({ createdAt: -1 });

    res.status(200).json({success: true,message: "Fetched fee data succesfully",data:fees});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
};

export const assignFeeToClass = async (req, res) => {
  const { class: classId, amount, dueDate, title } = req.body;

  if (!classId || !amount || !dueDate || !title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const feeTemplate = new FeeTemplate({
      classId,
      title,
      amount,
      dueDate
    });
    await feeTemplate.save();

    const students = await Student.find({ student_class: classId });

    const feeRecords = students.map(student => ({
      student: student._id,
      classId,
      template: feeTemplate._id,
      status: 'pending'
    }));

    await Fee.insertMany(feeRecords);
    res.status(200).json({ message: 'Fee assigned successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign fee' });
  }
};

export const getMyFees = async (req, res) => {
  try {
    const studentId = req.user.id;

    const fees = await Fee.find({ student: studentId })
                  .populate({
                    path: 'template',
                    populate: { path: 'classId', select: 'name' },
                    select: 'title amount dueDate'
                  })
                  .sort({ createdAt: -1 });

    res.status(200).json({success: true,message: "Fetched fee data succesfully",data:fees});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch student fees' });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { feeId, email } = req.body;

    const fee = await Fee.findById(feeId).populate('template');
    if (!fee) return res.status(404).json({ message: 'Fee not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: fee.template.title,
              description: `Payment for ${fee.template.title}`,
            },
            unit_amount: Math.round(fee.template.amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('Stripe Checkout Session Error:', err);
    res.status(500).json({ message: 'Unable to create checkout session' });
  }
};