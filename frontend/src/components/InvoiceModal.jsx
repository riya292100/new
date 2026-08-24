import React from 'react';
import PropTypes from 'prop-types';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const InvoiceModal = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.orderNumber || 'QC99281'}`;
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-200 relative">
        {/* Top Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-black rounded-lg border border-emerald-200">
              Tax Invoice
            </span>
            <span className="text-xs text-gray-500 font-semibold">{invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div id="printable-invoice" className="text-gray-800 text-xs space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <span className="text-xl font-black text-gray-900 tracking-tight">
                  Quick<span className="text-emerald-600">Cart</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                QuickCart Retail India Pvt. Ltd.
                <br />
                GSTIN: 07AAACQ9821K1Z2 • CIN: U74999DL2024PTC98211
                <br />
                Registered Office: Connaught Place, New Delhi 110001
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-base font-black text-gray-900 uppercase tracking-wider">
                TAX INVOICE
              </h2>
              <p className="text-gray-500 mt-0.5">
                Invoice No: <strong>{invoiceNumber}</strong>
              </p>
              <p className="text-gray-500">Date: {invoiceDate}</p>
              <p className="text-gray-500">
                Order ID: <strong>#{order.orderNumber}</strong>
              </p>
            </div>
          </div>

          {/* Bill To & Ship To */}
          <div className="grid grid-cols-2 gap-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Billed To / Sold To
              </div>
              <div className="font-extrabold text-gray-900 text-sm mt-0.5">
                {order.customerName || 'Riya Gope'}
              </div>
              <div className="text-gray-600 mt-0.5">
                Phone: {order.customerPhone || '9876543210'}
                <br />
                Email: {order.customerEmail || 'customer@quickcart.com'}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Shipping Destination
              </div>
              <div className="font-extrabold text-gray-900 text-sm mt-0.5">
                {order.address?.label || 'Home'} Delivery
              </div>
              <div className="text-gray-600 mt-0.5">
                {order.address?.streetAddress || 'Flat 402, Green Valley Heights'},{' '}
                {order.address?.city || 'New Delhi'} - {order.address?.pincode || '110001'}
                <br />
                Delivery Tier: ⚡ 1-Hour SuperFast Express
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full text-left border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-[10px] uppercase font-bold text-gray-600 tracking-wider">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price</th>
                  <th className="p-2.5 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="p-2.5">
                      <div className="font-bold text-gray-900">{item.productName}</div>
                      <div className="text-[10px] text-gray-400">
                        {item.unitQuantity || '1 Unit'} • Seller: SuperComNet India
                      </div>
                    </td>
                    <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                    <td className="p-2.5 text-right font-semibold">₹{item.unitPrice}</td>
                    <td className="p-2.5 text-right font-bold text-gray-900">
                      ₹{item.totalPrice || item.quantity * item.unitPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold">₹{order.totalAmount || 0}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>1-Hour Express Delivery</span>
                <span className="text-emerald-700 font-bold">FREE (Promotional)</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (Integrated 18% included)</span>
                <span className="font-bold">
                  ₹{Math.round((Number(order.totalAmount || 0) * 18) / 118)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-1.5 text-sm font-black text-gray-900">
                <span>Total Amount Paid</span>
                <span className="text-emerald-700">₹{order.totalAmount || 0}</span>
              </div>
              <div className="text-[10px] text-gray-400 text-right pt-0.5">
                Payment Mode: {order.paymentMethod || 'UPI Instant'}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400">
            <div className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Tax Invoice generated by
              QuickCart
            </div>
            <div>Authorized Signatory: QuickCart India Hub</div>
          </div>
        </div>
      </div>
    </div>
  );
};

InvoiceModal.propTypes = {
  order: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default InvoiceModal;
