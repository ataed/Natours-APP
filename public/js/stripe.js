/* eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51H9jizKQhvYZGmV9NrXaRbImqEPUW3zW2tL0EWEgiAavOltWlXcHhwgEyUuom6va1IbvRX2cD6l5PzuW3cQL4xCI00mqgzfBRp'
);

export const bookTour = async (tourId) => {
  //Get checkout session from the API
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    //Create the form

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
