export interface CheckoutDetails {
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  payment: { nameOnCard: string; cardNumber: string; expiryDate: string; cvv: string };
}
