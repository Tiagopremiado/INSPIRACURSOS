import React, { useState, useEffect, useCallback } from 'react';
import { Coupon, Course } from '../../types';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { EditIcon, TrashIcon, PlusIcon, TagIcon } from '../../components/icons';

// --- Coupon Form ---
const CouponForm: React.FC<{
  initialData?: Coupon | null;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}> = ({ initialData, onSave, onClose }) => {
    const [code, setCode] = useState(initialData?.code || '');
    const [discountPercentage, setDiscountPercentage] = useState(initialData?.discountPercentage || 10);
    const [expiresAt, setExpiresAt] = useState(initialData ? initialData.expiresAt.substring(0, 16) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16));
    const [courseId, setCourseId] = useState(initialData?.courseId || '');
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        api.getCourses().then(setAllCourses);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const couponData = {
            code: code.toUpperCase(),
            discountPercentage: Number(discountPercentage),
            expiresAt: new Date(expiresAt).toISOString(),
            isActive,
            courseId: courseId || undefined,
        }
        await onSave(couponData);
        setIsSaving(false);
    };

    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Código do Cupom</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value)} className={inputStyle} placeholder="EX: PROMO15" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Porcentagem de Desconto (%)</label>
                <input type="number" min="1" max="100" value={discountPercentage} onChange={e => setDiscountPercentage(Number(e.target.value))} className={inputStyle} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Expira em</label>
                <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className={inputStyle} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Aplicar a um curso específico (opcional)</label>
                <select value={courseId} onChange={e => setCourseId(e.target.value)} className={inputStyle}>
                    <option value="">Todos os cursos</option>
                    {allCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>
            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center w-24">
                    {isSaving ? <Spinner/> : 'Salvar'}
                </button>
            </div>
        </form>
    );
};


// --- Main Management Component ---
const OffersAndCouponsManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const courseMap = new Map(courses.map(c => [c.id, c.title]));

  const fetchCouponsAndCourses = useCallback(async () => {
    setIsLoading(true);
    try {
        const [couponsData, coursesData] = await Promise.all([
            api.getCoupons(),
            api.getCourses()
        ]);
        setCoupons(couponsData);
        setCourses(coursesData);
    } catch (error) {
        console.error("Failed to fetch data:", error);
        alert('Falha ao carregar dados.');
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCouponsAndCourses();
  }, [fetchCouponsAndCourses]);

  const handleOpenModal = (coupon?: Coupon) => {
    setEditingCoupon(coupon || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSaveCoupon = async (data: Omit<Coupon, 'id'>) => {
    try {
        if (editingCoupon) {
            await api.updateCoupon(editingCoupon.id, data);
        } else {
            await api.createCoupon(data);
        }
        await fetchCouponsAndCourses();
        handleCloseModal();
    } catch(err: any) {
        alert(`Erro ao salvar: ${err.message}`);
    }
  };
  
  const handleDeleteCoupon = async (couponId: string) => {
    if(window.confirm('Tem certeza que deseja excluir este cupom?')) {
        await api.deleteCoupon(couponId);
        await fetchCouponsAndCourses();
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
        await api.updateCoupon(coupon.id, { isActive: !coupon.isActive });
        await fetchCouponsAndCourses();
    } catch (err: any) {
        alert(`Erro ao atualizar status: ${err.message}`);
    }
  }
  
  if (isLoading) {
    return <div className="text-center p-10">Carregando cupons e ofertas...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <TagIcon className="h-7 w-7 mr-3 text-blue-600" />
            Ofertas e Cupons
        </h2>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
            <PlusIcon className="h-5 w-5"/>
            <span>Novo Cupom</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expira em</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso Alvo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map(coupon => {
                const isExpired = new Date(coupon.expiresAt) < new Date();
                return (
                    <tr key={coupon.id} className={isExpired ? 'bg-gray-100 text-gray-400' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{coupon.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{coupon.discountPercentage}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(coupon.expiresAt).toLocaleString('pt-BR')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{coupon.courseId ? courseMap.get(coupon.courseId) || 'Curso não encontrado' : 'Todos os cursos'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isExpired ? 'bg-red-100 text-red-800' : (coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}`}>
                                {isExpired ? 'Expirado' : (coupon.isActive ? 'Ativo' : 'Inativo')}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                           <button onClick={() => handleToggleActive(coupon)} className={`px-3 py-1 text-sm rounded-full ${coupon.isActive && !isExpired ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`} disabled={isExpired}>
                                {coupon.isActive && !isExpired ? 'Desativar' : 'Ativar'}
                            </button>
                            <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-1 text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                        </td>
                    </tr>
                )
            })}
          </tbody>
        </table>
         {coupons.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                <p>Nenhum cupom encontrado.</p>
                <p className="text-sm">Clique em "Novo Cupom" para criar sua primeira oferta.</p>
            </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCoupon ? "Editar Cupom" : "Criar Novo Cupom"}>
        <CouponForm 
            initialData={editingCoupon}
            onSave={handleSaveCoupon}
            onClose={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default OffersAndCouponsManagement;