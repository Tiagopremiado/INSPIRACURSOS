
import React, { useState } from 'react';
import { Course, User } from '../types';
import { api } from '../services/api';
import Spinner from '../components/Spinner';

interface CheckoutPageProps {
  course: Course;
  user: User;
  onBack: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ course, user, onBack }) => {
  const [couponCode, setCouponCode] = useState('');
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  
  const [finalPrice, setFinalPrice] = useState(course.price);
  const [discount, setDiscount] = useState(0);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsVerifyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const { discountPercentage } = await api.validateCoupon(couponCode, course.id);
      const discountAmount = course.price * (discountPercentage / 100);
      setDiscount(discountAmount);
      setFinalPrice(course.price - discountAmount);
      setCouponSuccess(`Cupom "${couponCode.toUpperCase()}" aplicado!`);
    } catch (err: any) {
      setCouponError(err.message || 'Erro ao aplicar cupom.');
      setDiscount(0);
      setFinalPrice(course.price);
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse no curso "${course.title}". O valor final, com o desconto que apliquei, ficou em R$ ${finalPrice.toFixed(2).replace('.', ',')}. Poderia me ajudar a finalizar a matrícula?`
  );
  const whatsappLink = `https://wa.me/5511999999999?text=${whatsappMessage}`;


  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Finalize sua Compra</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Course and Coupon */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
          <div className="flex items-center space-x-4">
            <img src={course.imageUrl} alt={course.title} className="w-32 h-20 object-cover rounded-md"/>
            <div>
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-gray-500">Valor original: R$ {course.price.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
          
          <div>
            <label htmlFor="coupon" className="font-semibold text-gray-700">Adicionar cupom de desconto</label>
            <div className="mt-2 flex gap-2">
              <input
                id="coupon"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Ex: PROMO10"
                className="flex-grow shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-900 bg-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                disabled={isVerifyingCoupon}
              />
              <button 
                onClick={handleApplyCoupon}
                className="bg-gray-800 text-white px-5 py-2 rounded-md font-semibold hover:bg-gray-700 transition-colors duration-300 flex justify-center items-center w-32 disabled:bg-gray-400"
                disabled={isVerifyingCoupon || !couponCode}
              >
                {isVerifyingCoupon ? <Spinner /> : 'Aplicar'}
              </button>
            </div>
            {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
            {couponSuccess && <p className="text-green-600 text-sm mt-2">{couponSuccess}</p>}
          </div>
        </div>

        {/* Right Column: Order Summary & Next Steps */}
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-xl shadow-lg space-y-3">
            <h3 className="text-xl font-bold border-b pb-3 mb-3">Resumo do Pedido</h3>
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>R$ {course.price.toFixed(2).replace('.', ',')}</span>
            </div>
            {discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                    <span>Desconto ({couponCode.toUpperCase()}):</span>
                    <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-gray-900 border-t pt-3 mt-3">
              <span>Total:</span>
              <span className="text-blue-600">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

           <div className="p-6 bg-white rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Próximos Passos</h3>
                <p className="text-gray-600 mb-5">Para finalizar sua matrícula e liberar o seu acesso, por favor, entre em contato com um de nossos consultores pelo WhatsApp.</p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-600 transition-colors duration-300 text-lg flex items-center justify-center"
                >
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.004 4.971-1.677-.176.292c-.452.76-.697 1.636-.697 2.569z"/></svg>
                    Falar com Consultor (WhatsApp)
                </a>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-start items-center border-t pt-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 font-semibold"
        >
          &larr; Voltar aos cursos
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;