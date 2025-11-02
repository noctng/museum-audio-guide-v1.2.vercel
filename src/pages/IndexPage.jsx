import React, { useState, useEffect } from 'react';
import LanguageSelector from '@/components/LanguageSelector';
import ArtifactInput from '@/components/ArtifactInput';
import AudioPlayer from '@/components/AudioPlayer';
import VisitorInfoPage from '@/pages/VisitorInfoPage';
import { supabase } from '@/lib/supabaseClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Lấy session từ localStorage và kiểm tra hợp lệ
const getVisitorSession = () => {
  const sessionStr = localStorage.getItem('visitorSession');
  if (!sessionStr) return null;
  try {
    const session = JSON.parse(sessionStr);
    if (!session.expires_at || new Date(session.expires_at) > new Date()) {
      return session;
    }
    localStorage.removeItem('visitorSession');
    return null;
  } catch {
    localStorage.removeItem('visitorSession');
    return null;
  }
};

export default function IndexPage() {
  const [visitorSession, setVisitorSession] = useState(getVisitorSession);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [artifactCode, setArtifactCode] = useState(null);
  const [artifactData, setArtifactData] = useState(null);
  const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);

  const handleVisitorLogout = () => {
    localStorage.removeItem('visitorSession');
    setVisitorSession(null);
    setSelectedLanguage(null);
    setArtifactCode(null);
    setArtifactData(null);
    setIsExpiredModalOpen(false);
  };

  // Kiểm tra hết hạn session theo thời gian thực
  useEffect(() => {
    if (!visitorSession?.expires_at) return;

    const interval = setInterval(() => {
      if (new Date(visitorSession.expires_at) < new Date()) {
        setIsExpiredModalOpen(true);
        clearInterval(interval);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [visitorSession]);

  // Khi đăng ký hoặc đăng nhập thành công
  const handleVisitorSubmitSuccess = (visitorData) => {
    const sessionData = {
      id: visitorData.id,
      name: visitorData.full_name,
      status: visitorData.status,
      activated_at: visitorData.activated_at,
      expires_at: visitorData.expires_at,
    };
    localStorage.setItem('visitorSession', JSON.stringify(sessionData));
    setVisitorSession(sessionData);
  };

  const handleLanguageSelect = (langCode) => setSelectedLanguage(langCode);

  const handleArtifactSubmit = async (code) => {
    const { data, error } = await supabase
      .from('AudioGuide')
      .select('*')
      .eq('artifact_code', code.toUpperCase())
      .single();

    if (error || !data) {
      alert(`Artifact với mã "${code}" không tìm thấy.`);
      setArtifactData(null);
    } else {
      setArtifactData(data);
      setArtifactCode(code.toUpperCase());
    }
  };

  const handleBack = () => {
    setArtifactCode(null);
    setArtifactData(null);
  };

  const handleLanguageChange = (lang) => lang && setSelectedLanguage(lang);

  const handleBackToHome = () => {
    setSelectedLanguage(null);
    setArtifactCode(null);
    setArtifactData(null);
  };

  let currentPage;
  if (!visitorSession) {
    currentPage = <VisitorInfoPage onSuccess={handleVisitorSubmitSuccess} />;
  } else if (!selectedLanguage) {
    currentPage = (
      <LanguageSelector
        onLanguageSelect={handleLanguageSelect}
        visitorSession={visitorSession}
        onLogout={handleVisitorLogout}
      />
    );
  } else if (!artifactCode) {
    currentPage = (
      <ArtifactInput
        selectedLanguage={selectedLanguage}
        onArtifactSubmit={handleArtifactSubmit}
        onBackToHome={handleBackToHome}
      />
    );
  } else {
    currentPage = (
      <AudioPlayer
        language={selectedLanguage}
        artifactCode={artifactCode}
        onLanguageChange={handleLanguageChange}
        onBack={handleBack}
        onBackToHome={handleBackToHome}
        artifactData={artifactData}
        onArtifactSubmit={handleArtifactSubmit}
        visitorSession={visitorSession}
        onLogout={handleVisitorLogout}
      />
    );
  }

  return (
    <>
      {currentPage}

      <AlertDialog open={isExpiredModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Phiên đã hết hạn</AlertDialogTitle>
            <AlertDialogDescription>
              Thời gian sử dụng của bạn đã kết thúc. Vui lòng đăng ký lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleVisitorLogout}>
              Đồng ý
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
