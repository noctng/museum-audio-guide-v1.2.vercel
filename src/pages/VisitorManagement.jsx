import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, PauseCircle, Search } from 'lucide-react';

export default function VisitorManagementPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching visitors:', error);
      alert('Không thể tải danh sách visitor.');
    } else {
      setVisitors(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  // 🔹 Kích hoạt lại visitor
  const handleReactivate = async (visitorId) => {
    setProcessingId(visitorId);
    const newExpiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('visitors')
      .update({
        status: 'active',
        activated_at: new Date().toISOString(),
        expires_at: newExpiresAt,
      })
      .eq('id', visitorId);

    if (error) {
      console.error('Error reactivating visitor:', error);
      alert('Không thể kích hoạt lại tài khoản.');
    } else {
      await fetchVisitors();
    }
    setProcessingId(null);
  };

  // 🔹 Ngừng kích hoạt visitor
  const handleDeactivate = async (visitorId) => {
    setProcessingId(visitorId);

    const { error } = await supabase
      .from('visitors')
      .update({
        status: 'inactive',
        expires_at: null,
      })
      .eq('id', visitorId);

    if (error) {
      console.error('Error deactivating visitor:', error);
      alert('Không thể ngừng kích hoạt tài khoản.');
    } else {
      await fetchVisitors();
    }
    setProcessingId(null);
  };

  const getStatusBadge = (status, expiresAt) => {
    if (status === 'inactive') {
      return { text: 'Ngừng kích hoạt', className: 'bg-gray-200 text-gray-700' };
    }

    const isExpired = expiresAt && new Date(expiresAt) < new Date();
    return isExpired
      ? { text: 'Hết hạn', className: 'bg-red-100 text-red-800' }
      : { text: 'Đang hoạt động', className: 'bg-green-100 text-green-800' };
  };

  // 🔍 Lọc danh sách theo tên hoặc số điện thoại
  const filteredVisitors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return visitors;
    return visitors.filter(
      (v) =>
        v.full_name.toLowerCase().includes(q) ||
        v.phone_number.toLowerCase().includes(q)
    );
  }, [searchQuery, visitors]);

  return (
    <div className="p-4 sm:p-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Quản lý Visitor</CardTitle>
            <p className="text-sm text-slate-500">
              Danh sách khách tham quan và trạng thái hoạt động. Mỗi tài khoản có thời hạn sử dụng 3 giờ.
            </p>
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p>Đang tải danh sách visitor...</p>
          ) : filteredVisitors.length === 0 ? (
            <p className="text-center text-slate-500 py-6">Không tìm thấy kết quả phù hợp.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian kích hoạt</TableHead>
                  <TableHead>Hết hạn lúc</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredVisitors.map((v) => {
                  const statusInfo = getStatusBadge(v.status, v.expires_at);
                  const isProcessing = processingId === v.id;
                  const canReactivate = v.status === 'inactive' || (v.expires_at && new Date(v.expires_at) < new Date());
                  const canDeactivate = v.status === 'active' && (!v.expires_at || new Date(v.expires_at) > new Date());

                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.full_name}</TableCell>
                      <TableCell>{v.phone_number}</TableCell>
                      <TableCell>{new Date(v.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                      </TableCell>
                      <TableCell>
                        {v.activated_at
                          ? new Date(v.activated_at).toLocaleString()
                          : <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell>
                        {v.expires_at
                          ? new Date(v.expires_at).toLocaleString()
                          : <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {canReactivate && (
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                            onClick={() => handleReactivate(v.id)}
                            disabled={isProcessing}
                          >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
                            {isProcessing ? 'Đang kích hoạt...' : 'Kích hoạt lại'}
                          </Button>
                        )}

                        {canDeactivate && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeactivate(v.id)}
                            disabled={isProcessing}
                          >
                            <PauseCircle className="mr-2 h-4 w-4" />
                            {isProcessing ? 'Đang xử lý...' : 'Ngừng kích hoạt'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
