import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { PlusCircle, FilePenLine, Trash2, BarChart2 } from 'lucide-react';

export default function ArtifactManagementPage() {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingArtifact, setEditingArtifact] = useState(null);

  const initialFormData = {
    artifact_code: '',
    image_url: '',
    title_en: '', title_vi: '', title_zh: '', title_ru: '', title_ko: '', title_ja: '', title_fr: '', title_de: '',
    desc_en: '', desc_vi: '', desc_zh: '', desc_ru: '',desc_ko: '', desc_ja: '', desc_fr: '', desc_de: '',
    audio_en: '', audio_vi: '', audio_zh: '', audio_ru: '', audio_ko: '', audio_ja: '', audio_fr: '', audio_de: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State cho chức năng xóa
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [artifactToDelete, setArtifactToDelete] = useState(null);

  // NEW: State cho thống kê (Stats)
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [statsArtifact, setStatsArtifact] = useState(null);

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    setLoading(true);
    // listen_counts is jsonb, fetching * gets it automatically
    const { data, error } = await supabase.from('AudioGuide').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching artifacts:', error);
    else setArtifacts(data);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditClick = (artifact) => {
    setEditingArtifact(artifact);
    setFormData({
      artifact_code: artifact.artifact_code,
      image_url: artifact.image_url || '',
      title_en: artifact.title?.en || '', title_vi: artifact.title?.vi || '', title_zh: artifact.title?.zh || '', title_ru: artifact.title?.ru || '',
      title_ko: artifact.title?.ko || '', title_ja: artifact.title?.ja || '', title_fr: artifact.title?.fr || '', title_de: artifact.title?.de || '',
      desc_en: artifact.description?.en || '', desc_vi: artifact.description?.vi || '', desc_zh: artifact.description?.zh || '', desc_ru: artifact.description?.ru || '',
      desc_ko: artifact.description?.ko || '', desc_ja: artifact.description?.ja || '', desc_fr: artifact.description?.fr || '', desc_de: artifact.description?.de || '',
      audio_en: artifact.audio_urls?.en || '', audio_vi: artifact.audio_urls?.vi || '', audio_zh: artifact.audio_urls?.zh || '', audio_ru: artifact.audio_urls?.ru || '',
      audio_ko: artifact.audio_urls?.ko || '', audio_ja: artifact.audio_urls?.ja || '', audio_fr: artifact.audio_urls?.fr || '', audio_de: artifact.audio_urls?.de || '',
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditingArtifact(null);
    setFormData(initialFormData);
    setIsDialogOpen(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const artifactData = {
      artifact_code: formData.artifact_code.toUpperCase(),
      image_url: formData.image_url,
      title: {
        en: formData.title_en, vi: formData.title_vi, zh: formData.title_zh,
        ko: formData.title_ko, ru: formData.title_ru, ja: formData.title_ja, fr: formData.title_fr, de: formData.title_de,
      },
      description: {
        en: formData.desc_en, vi: formData.desc_vi, zh: formData.desc_zh,
        ru: formData.desc_ru, ko: formData.desc_ko, ja: formData.desc_ja, fr: formData.desc_fr, de: formData.desc_de,
      },
       audio_urls: {
        en: formData.audio_en, vi: formData.audio_vi, zh: formData.audio_zh,
        ru: formData.audio_ru, ko: formData.audio_ko, ja: formData.audio_ja, fr: formData.audio_fr, de: formData.audio_de,
      }
    };
    
    let error;
    if (editingArtifact) {
      const { error: updateError } = await supabase.from('AudioGuide').update(artifactData).eq('id', editingArtifact.id);
      error = updateError;
    } else {
      // Khi tạo mới, khởi tạo listen_counts rỗng
      const { error: insertError } = await supabase.from('AudioGuide').insert([{...artifactData, listen_counts: {}}]);
      error = insertError;
    }

    if (error) {
      alert('Error saving artifact: ' + error.message);
    } else {
      alert(`Artifact ${editingArtifact ? 'updated' : 'added'} successfully!`);
      handleDialogClose();
      fetchArtifacts();
    }
  };

  const handleDeleteClick = (artifact) => {
    setArtifactToDelete(artifact);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!artifactToDelete) return;

    const { error } = await supabase
      .from('AudioGuide')
      .delete()
      .eq('id', artifactToDelete.id);

    if (error) {
      alert('Error deleting artifact: ' + error.message);
    } else {
      alert(`Artifact ${artifactToDelete.artifact_code} deleted successfully!`);
      fetchArtifacts();
    }

    setIsAlertOpen(false);
    setArtifactToDelete(null);
  };

  // NEW: Mở hộp thoại thống kê
  const handleStatsClick = (artifact) => {
    setStatsArtifact(artifact);
    setIsStatsOpen(true);
  };

  const languageNames = {
    en: 'English', vi: 'Tiếng Việt', zh: 'Chinese', ru: 'Russian',
    ko: 'Korean', ja: 'Japanese', fr: 'French', de: 'German'
  };

  return (
    <div className="p-4 sm:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Artifact Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => isOpen ? setIsDialogOpen(true) : handleDialogClose()}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingArtifact ? 'Edit Artifact' : 'Add New AudioGuide'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                 <div className='space-y-1'>
                    <label htmlFor="artifact_code" className="font-semibold">Artifact Code</label>
                    <Input id="artifact_code" name="artifact_code" value={formData.artifact_code} onChange={handleInputChange} required disabled={!!editingArtifact} />
                </div>
                 
                 <div className='space-y-1'>
                    <label htmlFor="image_url" className="font-semibold">Image URL</label>
                    <Input id="image_url" name="image_url" placeholder="https://example.com/image.png" value={formData.image_url} onChange={handleInputChange} />
                </div>
                
                <h3 className='font-semibold mt-4 border-b pb-2'>Title</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                    <Input name="title_en" placeholder="English" value={formData.title_en} onChange={handleInputChange}/>
                    <Input name="title_vi" placeholder="Vietnamese" value={formData.title_vi} onChange={handleInputChange}/>
                    <Input name="title_zh" placeholder="Chinese" value={formData.title_zh} onChange={handleInputChange}/>
                    <Input name="title_ru" placeholder="Russian" value={formData.title_ru} onChange={handleInputChange}/>
                    <Input name="title_ko" placeholder="Korean" value={formData.title_ko} onChange={handleInputChange}/>
                    <Input name="title_ja" placeholder="Japanese" value={formData.title_ja} onChange={handleInputChange}/>
                    <Input name="title_fr" placeholder="French" value={formData.title_fr} onChange={handleInputChange}/>
                    <Input name="title_de" placeholder="German" value={formData.title_de} onChange={handleInputChange}/>
                </div>

                <h3 className='font-semibold mt-4 border-b pb-2'>Description</h3>
                <div className='space-y-3'>
                    <Textarea name="desc_en" placeholder="English Description" value={formData.desc_en} onChange={handleInputChange}/>
                    <Textarea name="desc_vi" placeholder="Vietnamese Description" value={formData.desc_vi} onChange={handleInputChange}/>
                    <Textarea name="desc_zh" placeholder="Chinese Description" value={formData.desc_zh} onChange={handleInputChange}/>
                    <Textarea name="desc_ru" placeholder="Russian Description" value={formData.desc_ru} onChange={handleInputChange}/>
                    <Textarea name="desc_ko" placeholder="Korean Description" value={formData.desc_ko} onChange={handleInputChange}/>
                    <Textarea name="desc_ja" placeholder="Japanese Description" value={formData.desc_ja} onChange={handleInputChange}/>
                    <Textarea name="desc_fr" placeholder="French Description" value={formData.desc_fr} onChange={handleInputChange}/>
                    <Textarea name="desc_de" placeholder="German Description" value={formData.desc_de} onChange={handleInputChange}/>
                </div>

                <h3 className='font-semibold mt-4 border-b pb-2'>Audio URLs</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                    <Input name="audio_en" placeholder="English Audio URL" value={formData.audio_en} onChange={handleInputChange}/>
                    <Input name="audio_vi" placeholder="Vietnamese Audio URL" value={formData.audio_vi} onChange={handleInputChange}/>
                    <Input name="audio_zh" placeholder="Chinese Audio URL" value={formData.audio_zh} onChange={handleInputChange}/>
                    <Input name="audio_ru" placeholder="Russian Audio URL" value={formData.audio_ru} onChange={handleInputChange}/>
                    <Input name="audio_ko" placeholder="Korean Audio URL" value={formData.audio_ko} onChange={handleInputChange}/>
                    <Input name="audio_ja" placeholder="Japanese Audio URL" value={formData.audio_ja} onChange={handleInputChange}/>
                    <Input name="audio_fr" placeholder="French Audio URL" value={formData.audio_fr} onChange={handleInputChange}/>
                    <Input name="audio_de" placeholder="German Audio URL" value={formData.audio_de} onChange={handleInputChange}/>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title (EN)</TableHead>
                  <TableHead>Description (EN)</TableHead>
                  <TableHead>Listens</TableHead> {/* New Column */}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artifacts.map((artifact) => {
                  // Tính tổng lượt nghe
                  const totalListens = Object.values(artifact.listen_counts || {}).reduce((a, b) => a + b, 0);

                  return (
                    <TableRow key={artifact.id}>
                      <TableCell className="font-medium">{artifact.artifact_code}</TableCell>
                      <TableCell>{artifact.title?.en}</TableCell>
                      <TableCell className="max-w-sm truncate">{artifact.description?.en}</TableCell>
                      <TableCell>{totalListens}</TableCell> {/* New Data */}
                      <TableCell>
                        <div className="flex gap-2">
                          {/* NEW: Nút thống kê */}
                          <Button variant="outline" size="icon" onClick={() => handleStatsClick(artifact)} title="View Statistics">
                            <BarChart2 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleEditClick(artifact)} title="Edit">
                            <FilePenLine className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(artifact)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Hộp thoại xóa */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the artifact{' '}
              <span className="font-bold">{artifactToDelete?.artifact_code}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setArtifactToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* NEW: Hộp thoại thống kê chi tiết */}
      <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Listen Statistics: {statsArtifact?.artifact_code}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-medium mb-4 text-lg text-slate-700">{statsArtifact?.title?.en}</h3>
            
            {(!statsArtifact?.listen_counts || Object.keys(statsArtifact.listen_counts).length === 0) ? (
              <p className="text-slate-500 text-center italic py-8">No listen data available yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Language</TableHead>
                    <TableHead className="text-right">Listen Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(statsArtifact.listen_counts)
                    .sort(([, a], [, b]) => b - a) // Sắp xếp giảm dần
                    .map(([langCode, count]) => (
                    <TableRow key={langCode}>
                      <TableCell className="font-medium flex items-center gap-3">
                        <span className="uppercase bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600 w-8 text-center">{langCode}</span>
                        {languageNames[langCode] || langCode}
                      </TableCell>
                      <TableCell className="text-right font-bold text-amber-600">{count}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50/50">
                    <TableCell className="font-bold text-slate-900">Total</TableCell>
                    <TableCell className="text-right font-bold text-slate-900 text-lg">
                      {Object.values(statsArtifact.listen_counts).reduce((a, b) => a + b, 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
