"use client";

import { useState } from "react";
import { ShippingInfo, PaymentInfo } from "@/types";

interface CheckoutFormProps {
  onSubmit: (shipping: ShippingInfo, payment: PaymentInfo) => Promise<void>;
  serverErrors: Record<string, string>;
  isSubmitting: boolean;
}

function validateForm(
  shipping: ShippingInfo,
  payment: PaymentInfo
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!shipping.firstName.trim()) errors.firstName = "First name is required";
  if (!shipping.lastName.trim()) errors.lastName = "Last name is required";
  if (!shipping.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
    errors.email = "Invalid email format";
  }
  if (!shipping.address.trim()) errors.address = "Address is required";
  if (!shipping.city.trim()) errors.city = "City is required";
  if (!shipping.state.trim()) errors.state = "State is required";
  if (!shipping.zipCode.trim()) {
    errors.zipCode = "Zip code is required";
  } else if (!/^\d{5}$/.test(shipping.zipCode)) {
    errors.zipCode = "Zip code must be 5 digits";
  }

  const cardDigits = payment.cardNumber.replace(/\s/g, "");
  if (!cardDigits) {
    errors.cardNumber = "Card number is required";
  } else if (!/^\d{16}$/.test(cardDigits)) {
    errors.cardNumber = "Card number must be 16 digits";
  }
  if (!payment.expiryDate.trim()) {
    errors.expiryDate = "Expiry date is required";
  } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiryDate)) {
    errors.expiryDate = "Expiry must be MM/YY format";
  }
  if (!payment.cvv.trim()) {
    errors.cvv = "CVV is required";
  } else if (!/^\d{3,4}$/.test(payment.cvv)) {
    errors.cvv = "CVV must be 3 or 4 digits";
  }
  if (!payment.nameOnCard.trim()) errors.nameOnCard = "Name on card is required";

  return errors;
}

export function CheckoutForm({ onSubmit, serverErrors, isSubmitting }: CheckoutFormProps) {
  const [shipping, setShipping] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [payment, setPayment] = useState<PaymentInfo>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allErrors = { ...errors, ...serverErrors };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(shipping, payment);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    await onSubmit(shipping, payment);
  };

  const updateShipping = (field: keyof ShippingInfo, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updatePayment = (field: keyof PaymentInfo, value: string) => {
    setPayment((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="checkout-form" noValidate>
      {/* Shipping Information */}
      <fieldset className="mb-8">
        <legend className="text-xl font-bold text-gray-900 mb-4">
          Shipping Information
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="First Name"
            id="shipping-first-name"
            testId="shipping-first-name"
            value={shipping.firstName}
            onChange={(v) => updateShipping("firstName", v)}
            error={allErrors.firstName}
          />
          <FormField
            label="Last Name"
            id="shipping-last-name"
            testId="shipping-last-name"
            value={shipping.lastName}
            onChange={(v) => updateShipping("lastName", v)}
            error={allErrors.lastName}
          />
          <FormField
            label="Email"
            id="shipping-email"
            testId="shipping-email"
            type="email"
            value={shipping.email}
            onChange={(v) => updateShipping("email", v)}
            error={allErrors.email}
            className="sm:col-span-2"
          />
          <FormField
            label="Address"
            id="shipping-address"
            testId="shipping-address"
            value={shipping.address}
            onChange={(v) => updateShipping("address", v)}
            error={allErrors.address}
            className="sm:col-span-2"
          />
          <FormField
            label="City"
            id="shipping-city"
            testId="shipping-city"
            value={shipping.city}
            onChange={(v) => updateShipping("city", v)}
            error={allErrors.city}
          />
          <FormField
            label="State"
            id="shipping-state"
            testId="shipping-state"
            value={shipping.state}
            onChange={(v) => updateShipping("state", v)}
            error={allErrors.state}
          />
          <FormField
            label="Zip Code"
            id="shipping-zip"
            testId="shipping-zip"
            value={shipping.zipCode}
            onChange={(v) => updateShipping("zipCode", v)}
            error={allErrors.zipCode}
          />
        </div>
      </fieldset>

      {/* Payment Information */}
      <fieldset className="mb-8">
        <legend className="text-xl font-bold text-gray-900 mb-4">
          Payment Information
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Name on Card"
            id="payment-name"
            testId="payment-name"
            value={payment.nameOnCard}
            onChange={(v) => updatePayment("nameOnCard", v)}
            error={allErrors.nameOnCard}
            className="sm:col-span-2"
          />
          <FormField
            label="Card Number"
            id="payment-card-number"
            testId="payment-card-number"
            value={payment.cardNumber}
            onChange={(v) => updatePayment("cardNumber", v)}
            error={allErrors.cardNumber}
            placeholder="1234 5678 9012 3456"
            className="sm:col-span-2"
          />
          <FormField
            label="Expiry Date"
            id="payment-expiry"
            testId="payment-expiry"
            value={payment.expiryDate}
            onChange={(v) => updatePayment("expiryDate", v)}
            error={allErrors.expiryDate}
            placeholder="MM/YY"
          />
          <FormField
            label="CVV"
            id="payment-cvv"
            testId="payment-cvv"
            value={payment.cvv}
            onChange={(v) => updatePayment("cvv", v)}
            error={allErrors.cvv}
            placeholder="123"
          />
        </div>
      </fieldset>

      <button
        type="submit"
        data-testid="submit-order-button"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Placing Order..." : "Place Order"}
      </button>
    </form>
  );
}

function FormField({
  label,
  id,
  testId,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  className = "",
}: {
  label: string;
  id: string;
  testId: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && (
        <p
          id={`${id}-error`}
          data-testid={`field-error-${testId}`}
          role="alert"
          className="text-red-500 text-sm mt-1"
        >
          {error}
        </p>
      )}
    </div>
  );
}
