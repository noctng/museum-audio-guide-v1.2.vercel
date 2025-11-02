import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

export default function UserManagementPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
             setMessage({ type: 'error', text: 'User with this email already exists.' });
        } else {
            setMessage({ type: 'success', text: `Successfully created user. A confirmation email has been sent to ${email}.` });
            setEmail('');
            setPassword('');
        }
    } else {
        setMessage({ type: 'error', text: 'An unknown error occurred.' });
    }

    setLoading(false);
  };

  return (
    <div className="p-4 sm:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            User Management
          </CardTitle>
           <p className="text-sm text-slate-500 pt-2">
            Create new staff accounts. New users will receive a confirmation email to verify their account before they can log in.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <label htmlFor="email" className="font-medium">Email Address</label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="staff@example.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Enter a strong password"
                minLength="6"
              />
               <p className="text-xs text-slate-500">Password should be at least 6 characters long.</p>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </form>

          {message && (
             <Alert className="mt-6" variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>
                    {message.text}
                </AlertDescription>
            </Alert>
          )}

        </CardContent>
      </Card>
    </div>
  );
}