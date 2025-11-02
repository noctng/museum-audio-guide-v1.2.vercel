import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Phone, LogIn } from 'lucide-react';

export default function VisitorInfoPage({ onSuccess }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) {
      setError('Vui lòng nhập đầy đủ họ tên và số điện thoại.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 🔎 1. Kiểm tra thông tin đã tồn tại chưa
      const { data: existingVisitor, error: checkError } = await supabase
        .from('visitors')
        .select('id, full_name, status, activated_at, expires_at')
        .eq('phone_number', phoneNumber.trim())
        .maybeSingle();

      if (checkError) throw checkError;

      // 🔎 2. Nếu đã có visitor
      if (existingVisitor) {
        if (existingVisitor.status === 'active') {
          // Nếu còn hạn → cho phép đăng nhập
          const now = new Date();
          const expiresAt = new Date(existingVisitor.expires_at);

          if (expiresAt < now) {
            setError('Thời gian sử dụng đã hết hạn. Vui lòng liên hệ nhân viên để gia hạn.');
            setLoading(false);
            return;
          }

          // Cho phép truy cập
          onSuccess(existingVisitor);
          setLoading(false);
          return;
        } else {
          // Nếu chưa active
          setError('Thông tin đã đăng ký. Vui lòng liên hệ nhân viên để kích hoạt lại.');
          setLoading(false);
          return;
        }
      }

      // 🆕 3. Nếu chưa tồn tại → tạo mới visitor
      const now = new Date();
      const expires_at = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(); // +3 giờ
      const activated_at = now.toISOString();

      const { data, error: insertError } = await supabase
        .from('visitors')
        .insert([
          {
            full_name: fullName.trim(),
            phone_number: phoneNumber.trim(),
            status: 'active',
            activated_at,
            expires_at,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (onSuccess && data) onSuccess(data);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <img src="/assets/logoBTCP.png" alt="Museum Logo" className="w-24 h-auto mx-auto mb-4" />
            <CardTitle className="text-2xl font-light text-slate-800">
              Chào mừng đến với Bảo tàng
            </CardTitle>
            <p className="text-slate-500">Vui lòng nhập thông tin để bắt đầu trải nghiệm</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Họ và Tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="09..."
                    required
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" /> Bắt đầu
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
